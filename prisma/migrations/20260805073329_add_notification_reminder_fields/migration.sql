-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "returnReminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MaintenanceRecord" ADD COLUMN     "dueReminderSentAt" TIMESTAMP(3);
