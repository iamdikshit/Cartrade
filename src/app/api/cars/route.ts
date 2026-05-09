import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Car } from "@/models/Car";
import { withAuth } from "@/lib/authMiddleware";
import {
  apiRateLimiter,
  getClientIdentifier,
  rateLimitResponse,
} from "@/lib/rateLimit";
import { JWTPayload } from "@/lib/jwt";
import { z } from "zod";

// ─── Public: Get all cars ─────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const limitResult = apiRateLimiter(clientId);
  if (!limitResult.success) return rateLimitResponse(limitResult.resetTime);

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "12"));
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const make = searchParams.get("make") || "";
    const fuelType = searchParams.get("fuelType") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    await connectDB();

    const query: any = {};
    if (status && ["active", "hold", "sold"].includes(status))
      query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { make: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { carId: { $regex: search, $options: "i" } },
      ];
    }
    if (make) query.make = { $regex: make, $options: "i" };
    if (fuelType) query.fuelType = fuelType;
    if (minPrice || maxPrice) {
      query.askingPrice = {};
      if (minPrice) query.askingPrice.$gte = parseInt(minPrice);
      if (maxPrice) query.askingPrice.$lte = parseInt(maxPrice);
    }

    const skip = (page - 1) * limit;
    const [cars, total] = await Promise.all([
      Car.find(query)
        .select(
          "carId name make model year color fuelType transmission odometer askingPrice status images ratings location slug createdAt views",
        )
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Car.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      cars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get cars error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 },
    );
  }
}

// Only validate truly required fields — rest passes through directly
const createCarSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  make: z.string().min(1).trim(),
  model: z.string().min(1).trim(),
  year: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1),
  fuelType: z.enum(["petrol", "diesel", "cng", "electric", "hybrid"]),
  transmission: z.enum(["manual", "automatic", "amt"]),
  status: z.enum(["active", "hold", "sold"]).default("active"),
  variant: z.string().optional(),
  color: z.string().optional(),
  odometer: z.number().optional(),
  price: z.number().optional(),
  askingPrice: z.number().optional(),
  description: z.string().max(2000).optional(),
});

// ─── Protected: Create car (FULL payload) ────────────────────────────────────
async function createCar(request: NextRequest & { user: JWTPayload }) {
  if (
    !request.user.permissions.includes("cars:create") &&
    request.user.role !== "root"
  ) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Validate required basic fields only
    const parseResult = createCarSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await connectDB();

    // Merge validated fields + ALL form data (images, ratings, docs, conditions)
    const carData = {
      ...parseResult.data,
      location: body.location || undefined,
      images: body.images || [],
      ratings: body.ratings || undefined,
      documents: body.documents || undefined,
      exteriorDetails: body.exteriorDetails || undefined,
      exteriorPanels: body.exteriorPanels || undefined,
      tyres: body.tyres || undefined,
      windshieldLights: body.windshieldLights || undefined,
      engineDetails: body.engineDetails || undefined,
      acDetails: body.acDetails || undefined,
      electricalDetails: body.electricalDetails || undefined,
      steeringDetails: body.steeringDetails || undefined,
      brakesSuspension: body.brakesSuspension || undefined,
      createdBy: request.user.userId,
    };

    const car = new Car(carData);
    await car.save();

    return NextResponse.json(
      {
        success: true,
        car: { id: car._id, carId: car.carId, slug: car.slug },
        message: "Car created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create car error:", error);
    return NextResponse.json(
      { error: "Failed to create car" },
      { status: 500 },
    );
  }
}

export const POST = withAuth(createCar);
