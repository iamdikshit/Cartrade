import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Car, ICar } from "@/models/Car";
import { withAuth } from "@/lib/authMiddleware";
import {
  apiRateLimiter,
  getClientIdentifier,
  rateLimitResponse,
} from "@/lib/rateLimit";
import { JWTPayload } from "@/lib/jwt";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const clientId = getClientIdentifier(request);
  const limitResult = apiRateLimiter(clientId);
  if (!limitResult.success) return rateLimitResponse(limitResult.resetTime);

  try {
    await connectDB();

    const { id } = params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId
      ? { _id: id }
      : { $or: [{ slug: id }, { carId: id }] };

    const car: (ICar & { _id: mongoose.Types.ObjectId }) | null =
      await Car.findOne(query);

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    // Increment views non-blocking
    Car.findByIdAndUpdate(car._id, { $inc: { views: 1 } })
      .exec()
      .catch(() => {});

    return NextResponse.json({
      success: true,
      car: JSON.parse(JSON.stringify(car)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch car" }, { status: 500 });
  }
}

async function updateCar(
  request: NextRequest & { user: JWTPayload },
  { params }: { params: { id: string } },
) {
  if (
    !request.user.permissions.includes("cars:edit") &&
    request.user.role !== "root"
  ) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  try {
    const body = await request.json();
    await connectDB();

    const car = await Car.findByIdAndUpdate(
      params.id,
      { ...body, updatedBy: request.user.userId },
      { new: true, runValidators: true },
    );

    if (!car)
      return NextResponse.json({ error: "Car not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      car,
      message: "Car updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update car", details: error.message },
      { status: 500 },
    );
  }
}

async function deleteCar(
  request: NextRequest & { user: JWTPayload },
  { params }: { params: { id: string } },
) {
  if (
    !request.user.permissions.includes("cars:delete") &&
    request.user.role !== "root"
  ) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  try {
    await connectDB();
    const car = await Car.findByIdAndDelete(params.id);
    if (!car)
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    return NextResponse.json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete car" },
      { status: 500 },
    );
  }
}

export const PUT = withAuth(updateCar);
export const DELETE = withAuth(deleteCar);
