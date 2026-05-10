import mongoose, { Schema, Document } from "mongoose";

export type ConditionStatus = "ok" | "repaired" | "notOk";
export type CarStatus = "active" | "hold" | "sold";

interface MediaItem {
  url: string;
  type: "image" | "video";
  caption?: string;
}

interface ComponentDetail {
  status: ConditionStatus;
  notes?: string;
  media?: MediaItem[];
}

export interface ICarRatings {
  exterior: number;
  engine: number;
  ac: number;
  electrical: number;
  steering: number;
}

export interface ICarDocuments {
  rcAvailability: boolean;
  insurance: "yes" | "no" | "expired";
  roadTaxPaid: boolean;
  hypothecation: boolean;
  other: {
    duplicateKey: boolean;
    chassisNumber: boolean;
    partyPeshi: boolean;
    pollutionNorm: "BSIII" | "BSIV" | "BSVI";
  };
  registrationAndFitness: {
    manufacturingDate?: Date;
    registrationDate?: Date;
    rtoCode?: string;
    rtoName?: string;
    fitnessExpiry?: Date;
  };
}

export interface IExteriorDetails {
  apron?: ComponentDetail;
  pillar?: ComponentDetail;
  cowlTop?: ComponentDetail;
  dicky?: ComponentDetail;
  leftQuarterPanel?: ComponentDetail;
  rightQuarterPanel?: ComponentDetail;
  firewall?: ComponentDetail;
  lowerMember?: ComponentDetail;
  leftRunningBoard?: ComponentDetail;
  headlightSupports?: ComponentDetail;
  upperMember?: ComponentDetail;
  rightRunningBoard?: ComponentDetail;
}

export interface IExteriorPanels {
  roof?: ComponentDetail;
  bonnet?: ComponentDetail;
  dickeyDoor?: ComponentDetail;
  rearBumper?: ComponentDetail;
  frontBumper?: ComponentDetail;
  leftFender?: ComponentDetail;
  rightFender?: ComponentDetail;
  rearLeftDoor?: ComponentDetail;
  frontLeftDoor?: ComponentDetail;
  rearRightDoor?: ComponentDetail;
  frontRightDoor?: ComponentDetail;
}

export interface ITyres {
  frontLeft?: ComponentDetail;
  frontRight?: ComponentDetail;
  rearLeft?: ComponentDetail;
  rearRight?: ComponentDetail;
  spare?: ComponentDetail;
}

export interface IWindshieldLights {
  headlights?: ComponentDetail;
  tailLights?: ComponentDetail;
  windshield?: ComponentDetail;
  leftSvm?: ComponentDetail;
  rightSvm?: ComponentDetail;
  leftHeadlight?: ComponentDetail;
  rightHeadlight?: ComponentDetail;
  leftTailLight?: ComponentDetail;
  rightTailLight?: ComponentDetail;
}

export interface IEngineDetails {
  exhaustSmoke?: ComponentDetail;
  engineMounting?: ComponentDetail;
  clutch?: ComponentDetail;
  engine?: ComponentDetail;
  engineSound?: ComponentDetail;
  battery?: ComponentDetail;
  coolingSystem?: ComponentDetail;
  engineOil?: ComponentDetail;
  gearShifting?: ComponentDetail;
}

export interface IACDetails {
  cooling?: ComponentDetail;
  compressor?: ComponentDetail;
  condenser?: ComponentDetail;
  blower?: ComponentDetail;
  controls?: ComponentDetail;
}

export interface IElectricalDetails {
  musicSystem?: ComponentDetail;
  powerWindows?: ComponentDetail;
  centralLocking?: ComponentDetail;
  horn?: ComponentDetail;
  wipers?: ComponentDetail;
  rearDefogger?: ComponentDetail;
  powerSteering?: ComponentDetail;
  instruments?: ComponentDetail;
}

export interface ISteeringDetails {
  steering?: ComponentDetail;
  horn?: ComponentDetail;
  alignment?: ComponentDetail;
}

export interface IBrakesSuspension {
  frontBrakes?: ComponentDetail;
  rearBrakes?: ComponentDetail;
  handbrake?: ComponentDetail;
  frontSuspension?: ComponentDetail;
  rearSuspension?: ComponentDetail;
}

export interface ICar extends Document {
  _id: mongoose.Types.ObjectId;
  carId: string;
  name: string;
  make: string;
  carModel: string;
  year: number;
  variant?: string;
  color?: string;
  fuelType: "petrol" | "diesel" | "cng" | "electric" | "hybrid";
  transmission: "manual" | "automatic" | "amt";
  odometer?: number;
  price?: number;
  askingPrice?: number;
  status: CarStatus;
  description?: string;
  slug: string;

  location?: {
    address?: string;
    lat?: number;
    lng?: number;
    city?: string;
    state?: string;
  };

  images: Array<{
    url: string;
    category:
      | "front"
      | "back"
      | "left"
      | "right"
      | "engine"
      | "interior"
      | "dashboard"
      | "other";
    caption?: string;
    isPrimary?: boolean;
  }>;

  ratings: ICarRatings;
  documents: ICarDocuments;
  exteriorDetails: IExteriorDetails;
  exteriorPanels: IExteriorPanels;
  tyres: ITyres;
  windshieldLights: IWindshieldLights;
  engineDetails: IEngineDetails;
  acDetails: IACDetails;
  electricalDetails: IElectricalDetails;
  steeringDetails: ISteeringDetails;
  brakesSuspension: IBrakesSuspension;

  views: number;
  inquiryCount: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  soldAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mediaItemSchema = new Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], default: "image" },
    caption: String,
  },
  { _id: false },
);

const componentDetailSchema = new Schema(
  {
    status: { type: String, enum: ["ok", "repaired", "notOk"], required: true },
    notes: String,
    media: [mediaItemSchema],
  },
  { _id: false },
);

const carSchema = new Schema<ICar>(
  {
    carId: {
      type: String,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    make: { type: String, required: true, trim: true },
    carModel: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    variant: String,
    color: String,
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "cng", "electric", "hybrid"],
      required: true,
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic", "amt"],
      required: true,
    },
    odometer: Number,
    price: Number,
    askingPrice: Number,
    status: {
      type: String,
      enum: ["active", "hold", "sold"],
      default: "active",
      index: true,
    },
    description: { type: String, maxlength: 2000 },
    slug: { type: String, unique: true, index: true },

    location: {
      address: String,
      lat: Number,
      lng: Number,
      city: String,
      state: String,
    },

    images: [
      {
        url: { type: String, required: true },
        category: {
          type: String,
          enum: [
            "front",
            "back",
            "left",
            "right",
            "engine",
            "interior",
            "dashboard",
            "other",
          ],
          default: "other",
        },
        caption: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],

    ratings: {
      exterior: { type: Number, min: 0, max: 5, default: 0 },
      engine: { type: Number, min: 0, max: 5, default: 0 },
      ac: { type: Number, min: 0, max: 5, default: 0 },
      electrical: { type: Number, min: 0, max: 5, default: 0 },
      steering: { type: Number, min: 0, max: 5, default: 0 },
    },

    documents: {
      rcAvailability: { type: Boolean, default: false },
      insurance: {
        type: String,
        enum: ["yes", "no", "expired"],
        default: "no",
      },
      roadTaxPaid: { type: Boolean, default: false },
      hypothecation: { type: Boolean, default: false },
      other: {
        duplicateKey: { type: Boolean, default: false },
        chassisNumber: { type: Boolean, default: false },
        partyPeshi: { type: Boolean, default: false },
        pollutionNorm: {
          type: String,
          enum: ["BSIII", "BSIV", "BSVI"],
          default: "BSIV",
        },
      },
      registrationAndFitness: {
        manufacturingDate: Date,
        registrationDate: Date,
        rtoCode: String,
        rtoName: String,
        fitnessExpiry: Date,
      },
    },

    exteriorDetails: {
      apron: componentDetailSchema,
      pillar: componentDetailSchema,
      cowlTop: componentDetailSchema,
      dicky: componentDetailSchema,
      leftQuarterPanel: componentDetailSchema,
      rightQuarterPanel: componentDetailSchema,
      firewall: componentDetailSchema,
      lowerMember: componentDetailSchema,
      leftRunningBoard: componentDetailSchema,
      headlightSupports: componentDetailSchema,
      upperMember: componentDetailSchema,
      rightRunningBoard: componentDetailSchema,
    },

    exteriorPanels: {
      roof: componentDetailSchema,
      bonnet: componentDetailSchema,
      dickeyDoor: componentDetailSchema,
      rearBumper: componentDetailSchema,
      frontBumper: componentDetailSchema,
      leftFender: componentDetailSchema,
      rightFender: componentDetailSchema,
      rearLeftDoor: componentDetailSchema,
      frontLeftDoor: componentDetailSchema,
      rearRightDoor: componentDetailSchema,
      frontRightDoor: componentDetailSchema,
    },

    tyres: {
      frontLeft: componentDetailSchema,
      frontRight: componentDetailSchema,
      rearLeft: componentDetailSchema,
      rearRight: componentDetailSchema,
      spare: componentDetailSchema,
    },

    windshieldLights: {
      headlights: componentDetailSchema,
      tailLights: componentDetailSchema,
      windshield: componentDetailSchema,
      leftSvm: componentDetailSchema,
      rightSvm: componentDetailSchema,
      leftHeadlight: componentDetailSchema,
      rightHeadlight: componentDetailSchema,
      leftTailLight: componentDetailSchema,
      rightTailLight: componentDetailSchema,
    },

    engineDetails: {
      exhaustSmoke: componentDetailSchema,
      engineMounting: componentDetailSchema,
      clutch: componentDetailSchema,
      engine: componentDetailSchema,
      engineSound: componentDetailSchema,
      battery: componentDetailSchema,
      coolingSystem: componentDetailSchema,
      engineOil: componentDetailSchema,
      gearShifting: componentDetailSchema,
    },

    acDetails: {
      cooling: componentDetailSchema,
      compressor: componentDetailSchema,
      condenser: componentDetailSchema,
      blower: componentDetailSchema,
      controls: componentDetailSchema,
    },

    electricalDetails: {
      musicSystem: componentDetailSchema,
      powerWindows: componentDetailSchema,
      centralLocking: componentDetailSchema,
      horn: componentDetailSchema,
      wipers: componentDetailSchema,
      rearDefogger: componentDetailSchema,
      powerSteering: componentDetailSchema,
      instruments: componentDetailSchema,
    },

    steeringDetails: {
      steering: componentDetailSchema,
      horn: componentDetailSchema,
      alignment: componentDetailSchema,
    },

    brakesSuspension: {
      frontBrakes: componentDetailSchema,
      rearBrakes: componentDetailSchema,
      handbrake: componentDetailSchema,
      frontSuspension: componentDetailSchema,
      rearSuspension: componentDetailSchema,
    },

    views: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    soldAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// Auto-generate carId and slug
carSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = (await mongoose.models.Car?.countDocuments()) || 0;
    this.carId = `CT${String(count + 1001).padStart(5, "0")}`;

    const baseSlug = `${this.make}-${this.model}-${this.year}-${this.carId}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    this.slug = baseSlug;
  }

  if (this.status === "sold" && !this.soldAt) {
    this.soldAt = new Date();
  }

  next();
});

// Indexes for search
carSchema.index({ make: "text", model: "text", name: "text" });
carSchema.index({ status: 1, createdAt: -1 });
carSchema.index({ "location.city": 1 });

export const Car =
  mongoose.models.Car || mongoose.model<ICar>("Car", carSchema);
