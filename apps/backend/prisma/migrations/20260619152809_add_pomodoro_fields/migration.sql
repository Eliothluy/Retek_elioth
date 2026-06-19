-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "pomodoroSessions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timeSpentMinutes" INTEGER NOT NULL DEFAULT 0;
