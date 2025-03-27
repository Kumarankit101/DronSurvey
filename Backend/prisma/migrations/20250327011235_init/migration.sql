-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drone" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "batteryLevel" INTEGER NOT NULL,
    "lastMission" TIMESTAMP(3),
    "locationLat" TEXT,
    "locationLng" TEXT,

    CONSTRAINT "Drone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startLatitude" TEXT NOT NULL DEFAULT '0',
    "startLongitude" TEXT NOT NULL DEFAULT '0',
    "endLatitude" TEXT NOT NULL DEFAULT '0',
    "endLongitude" TEXT NOT NULL DEFAULT '0',
    "area" INTEGER,
    "type" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "locationId" INTEGER NOT NULL,
    "droneId" INTEGER,
    "status" TEXT NOT NULL,
    "missionType" TEXT NOT NULL,
    "completionPercentage" INTEGER NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" TEXT,
    "recurringDays" INTEGER[],
    "scheduledTime" TIMESTAMP(3),
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "surveyPatternData" JSONB NOT NULL,
    "surveyParameters" JSON NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyReport" (
    "id" SERIAL NOT NULL,
    "missionId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "areaCovered" TEXT,
    "status" TEXT NOT NULL,
    "summary" TEXT,
    "findings" JSONB NOT NULL,
    "imageUrls" TEXT[],

    CONSTRAINT "SurveyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "Drone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyReport" ADD CONSTRAINT "SurveyReport_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
