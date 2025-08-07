import asyncio
from datetime import datetime, timedelta
from typing import List
import logging
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PromotionScheduler:
    def __init__(self, db):
        self.db = db
        self.running = False
    
    async def check_promotion_schedules(self):
        """Check and update promotion active status based on dates"""
        now = datetime.utcnow()
        updated_count = 0
        
        try:
            # Find promotions that should be activated
            promotions_to_activate = await self.db.promotions.find({
                "is_active": False,
                "start_date": {"$lte": now},
                "end_date": {"$gte": now}
            }).to_list(100)
            
            if promotions_to_activate:
                promotion_ids = [p["id"] for p in promotions_to_activate]
                result = await self.db.promotions.update_many(
                    {"id": {"$in": promotion_ids}},
                    {"$set": {"is_active": True, "updated_at": now}}
                )
                updated_count += result.modified_count
                
                # Log activations
                for promo in promotions_to_activate:
                    await self.db.admin_logs.insert_one({
                        "username": "system",
                        "action": "auto_activate_promotion",
                        "resource_id": promo["id"],
                        "details": {"title": promo["title"], "reason": "scheduled_start"},
                        "timestamp": now
                    })
                
                logger.info(f"Auto-activated {result.modified_count} promotions")
            
            # Find promotions that should be deactivated
            promotions_to_deactivate = await self.db.promotions.find({
                "is_active": True,
                "end_date": {"$lt": now}
            }).to_list(100)
            
            if promotions_to_deactivate:
                promotion_ids = [p["id"] for p in promotions_to_deactivate]
                result = await self.db.promotions.update_many(
                    {"id": {"$in": promotion_ids}},
                    {"$set": {"is_active": False, "updated_at": now}}
                )
                updated_count += result.modified_count
                
                # Log deactivations
                for promo in promotions_to_deactivate:
                    await self.db.admin_logs.insert_one({
                        "username": "system",
                        "action": "auto_deactivate_promotion",
                        "resource_id": promo["id"],
                        "details": {"title": promo["title"], "reason": "scheduled_end"},
                        "timestamp": now
                    })
                
                logger.info(f"Auto-deactivated {result.modified_count} promotions")
            
            if updated_count > 0:
                logger.info(f"Promotion scheduler: Updated {updated_count} promotions")
            
        except Exception as e:
            logger.error(f"Error in promotion scheduler: {str(e)}")
    
    async def cleanup_expired_data(self):
        """Clean up old logs and expired data"""
        try:
            # Delete logs older than 90 days
            cutoff_date = datetime.utcnow() - timedelta(days=90)
            result = await self.db.admin_logs.delete_many({
                "timestamp": {"$lt": cutoff_date}
            })
            
            if result.deleted_count > 0:
                logger.info(f"Cleaned up {result.deleted_count} old log entries")
            
        except Exception as e:
            logger.error(f"Error in cleanup task: {str(e)}")
    
    async def generate_daily_report(self):
        """Generate daily activity report"""
        try:
            now = datetime.utcnow()
            start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Count active promotions
            active_promotions = await self.db.promotions.count_documents({
                "is_active": True,
                "start_date": {"$lte": now},
                "end_date": {"$gte": now}
            })
            
            # Count total promotions
            total_promotions = await self.db.promotions.count_documents({})
            
            # Count today's admin actions
            daily_actions = await self.db.admin_logs.count_documents({
                "timestamp": {"$gte": start_of_day}
            })
            
            report = {
                "date": now.strftime("%Y-%m-%d"),
                "active_promotions": active_promotions,
                "total_promotions": total_promotions,
                "daily_admin_actions": daily_actions,
                "generated_at": now
            }
            
            # Store the report
            await self.db.daily_reports.insert_one(report)
            logger.info(f"Generated daily report: {active_promotions} active promotions")
            
        except Exception as e:
            logger.error(f"Error generating daily report: {str(e)}")
    
    async def run_scheduler(self):
        """Main scheduler loop"""
        self.running = True
        logger.info("Promotion scheduler started")
        
        while self.running:
            try:
                current_time = datetime.utcnow()
                
                # Run promotion schedule check every hour
                await self.check_promotion_schedules()
                
                # Run cleanup at 2 AM UTC daily
                if current_time.hour == 2 and current_time.minute < 5:
                    await self.cleanup_expired_data()
                
                # Generate daily report at 1 AM UTC
                if current_time.hour == 1 and current_time.minute < 5:
                    await self.generate_daily_report()
                
                # Wait 5 minutes before next check
                await asyncio.sleep(300)
                
            except Exception as e:
                logger.error(f"Error in scheduler main loop: {str(e)}")
                await asyncio.sleep(60)  # Wait 1 minute on error
    
    def stop(self):
        """Stop the scheduler"""
        self.running = False
        logger.info("Promotion scheduler stopped")

# Global scheduler instance
scheduler_instance = None

async def start_scheduler(db):
    """Start the promotion scheduler"""
    global scheduler_instance
    if scheduler_instance is None:
        scheduler_instance = PromotionScheduler(db)
        # Run scheduler in background
        asyncio.create_task(scheduler_instance.run_scheduler())
        logger.info("Background promotion scheduler started")

async def stop_scheduler():
    """Stop the promotion scheduler"""
    global scheduler_instance
    if scheduler_instance:
        scheduler_instance.stop()
        scheduler_instance = None