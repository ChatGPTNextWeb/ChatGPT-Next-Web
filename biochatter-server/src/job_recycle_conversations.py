
import schedule
import threading
import time

from src.conversation_manager import recycle_conversations

def run_recycle_job(job_func):
    print(f"[fengsh] - {threading.get_native_id()} run_recycle_job")
    job_thread = threading.Thread(target=job_func)
    job_thread.start()

schedule.every().day.at("12:00", "America/New_York").do(run_recycle_job, recycle_conversations)
# schedule.every().minute.at(":17").do(run_recycle_job, recycle_conversations)

def run_scheduled_job_continuously(interval=60):
    print(f"[fengsh] - {threading.get_native_id()} run_scheduled_job_continuously")
    cease_continuous_run = threading.Event()

    class ScheduleThread(threading.Thread):
        @classmethod
        def run(cls):
            while not cease_continuous_run.is_set():
                schedule.run_pending()
                time.sleep(interval)
            print("exiting job thread ...")

    continuous_thread = ScheduleThread()
    continuous_thread.start()
    return cease_continuous_run
