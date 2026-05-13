"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { carBasicSchema, CarBasicInput } from "@/lib/validation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Save,
  Upload,
  Camera,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  MapPin,
  Star,
  FileText,
  Car,
  Zap,
  Wind,
  Cog,
  Lightbulb,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { FUEL_TYPES, TRANSMISSION_TYPES, IMAGE_CATEGORIES } from "@/lib/utils";

type ConditionStatus = "ok" | "repaired" | "notOk";

interface ComponentState {
  status: ConditionStatus;
  notes: string;
  media: Array<{ url: string; type: "image" | "video" }>;
}

// All components default to 'ok' status
const defaultComponent = (): ComponentState => ({
  status: "ok",
  notes: "",
  media: [],
});

// Build a full section map with all keys defaulted to 'ok'
function buildDefaultSection(keys: string[]): Record<string, ComponentState> {
  const result: Record<string, ComponentState> = {};
  keys.forEach((k) => {
    result[k] = defaultComponent();
  });
  return result;
}

const EXTERIOR_DETAILS_KEYS = [
  "apron",
  "pillar",
  "cowlTop",
  "dicky",
  "leftQuarterPanel",
  "rightQuarterPanel",
  "firewall",
  "lowerMember",
  "leftRunningBoard",
  "headlightSupports",
  "upperMember",
  "rightRunningBoard",
];
const EXTERIOR_PANELS_KEYS = [
  "roof",
  "bonnet",
  "dickeyDoor",
  "rearBumper",
  "frontBumper",
  "leftFender",
  "rightFender",
  "rearLeftDoor",
  "frontLeftDoor",
  "rearRightDoor",
  "frontRightDoor",
];
const TYRES_KEYS = [
  "frontLeft",
  "frontRight",
  "rearLeft",
  "rearRight",
  "spare",
];
const WINDSHIELD_KEYS = [
  "headlights",
  "tailLights",
  "windshield",
  "leftSvm",
  "rightSvm",
  "leftHeadlight",
  "rightHeadlight",
  "leftTailLight",
  "rightTailLight",
];
const ENGINE_KEYS = [
  "exhaustSmoke",
  "engineMounting",
  "clutch",
  "engine",
  "engineSound",
  "battery",
  "coolingSystem",
  "engineOil",
  "gearShifting",
];
const AC_KEYS = ["cooling", "compressor", "condenser", "blower", "controls"];
const ELECTRICAL_KEYS = [
  "musicSystem",
  "powerWindows",
  "centralLocking",
  "horn",
  "wipers",
  "rearDefogger",
  "powerSteering",
  "instruments",
];
const STEERING_KEYS = ["steering", "alignment"];
const BRAKES_KEYS = [
  "frontBrakes",
  "rearBrakes",
  "handbrake",
  "frontSuspension",
  "rearSuspension",
];

const CONDITION_OPTIONS = [
  {
    value: "ok",
    label: "OK",
    active: "bg-green-500 text-white border-green-500",
    inactive: "bg-white border-dark-200 text-dark-400 hover:border-green-300",
  },
  {
    value: "repaired",
    label: "Repaired",
    active: "bg-amber-500 text-white border-amber-500",
    inactive: "bg-white border-dark-200 text-dark-400 hover:border-amber-300",
  },
  {
    value: "notOk",
    label: "Not OK",
    active: "bg-red-500 text-white border-red-500",
    inactive: "bg-white border-dark-200 text-dark-400 hover:border-red-300",
  },
];

interface ComponentSectionProps {
  title: string;
  fields: Array<{ key: string; label: string }>;
  values: Record<string, ComponentState>;
  onChange: (key: string, val: ComponentState) => void;
  onUpload: (key: string, files: FileList) => Promise<void>;
  uploading: Record<string, boolean>;
}

function ComponentSection({
  title,
  fields,
  values,
  onChange,
  onUpload,
  uploading,
}: ComponentSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-dark-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-dark-50 hover:bg-dark-100 transition-colors text-left"
      >
        <span className="font-semibold text-dark-800">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-dark-400">{fields.length} items</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-dark-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-dark-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-4 space-y-4 bg-white">
          {fields.map(({ key, label }) => {
            const val = values[key] || defaultComponent();
            return (
              <div key={key} className="border border-dark-100 rounded-xl p-4">
                <p className="font-medium text-dark-800 text-sm mb-3">
                  {label}
                </p>

                {/* Status selector */}
                <div className="flex gap-2 mb-3">
                  {CONDITION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        onChange(key, {
                          ...val,
                          status: opt.value as ConditionStatus,
                        })
                      }
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                        val.status === opt.value ? opt.active : opt.inactive
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Notes */}
                <textarea
                  value={val.notes}
                  onChange={(e) =>
                    onChange(key, { ...val, notes: e.target.value })
                  }
                  placeholder="Additional notes (optional)"
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-dark-50 border border-dark-200 rounded-lg text-dark-800 placeholder-dark-400 focus:outline-none focus:border-brand-500 resize-none mb-3"
                />

                {/* Media upload using label (no useRef in map) */}
                <div className="flex items-center gap-2">
                  <label
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-dark-100 text-dark-600 rounded-lg hover:bg-dark-200 transition-colors cursor-pointer ${uploading[key] ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {uploading[key] ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    Gallery
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        e.target.files && onUpload(key, e.target.files)
                      }
                    />
                  </label>
                  <label
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-dark-100 text-dark-600 rounded-lg hover:bg-dark-200 transition-colors cursor-pointer ${uploading[key] ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <Camera className="w-3 h-3" />
                    Camera
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files && onUpload(key, e.target.files)
                      }
                    />
                  </label>
                </div>

                {/* Uploaded media thumbnails */}
                {val.media.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {val.media.map((m, i) => (
                      <div
                        key={i}
                        className="relative w-16 h-12 rounded-lg overflow-hidden bg-dark-100 group"
                      >
                        {m.type === "video" ? (
                          <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">
                            ▶
                          </div>
                        ) : (
                          <img
                            src={m.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            onChange(key, {
                              ...val,
                              media: val.media.filter((_, j) => j !== i),
                            })
                          }
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface CarFormProps {
  initialData?: any;
  carId?: string;
}

export default function CarForm({ initialData, carId }: CarFormProps) {
  const router = useRouter();
  const { fetchWithAuth } = useAdminAuth();
  const [saving, setSaving] = useState(false);

  // Images
  const [images, setImages] = useState<
    Array<{ url: string; category: string; isPrimary: boolean }>
  >(initialData?.images || []);
  const [imgUploading, setImgUploading] = useState(false);

  // Ratings — default all to 3.5
  const [ratings, setRatings] = useState(
    initialData?.ratings || {
      exterior: 3.5,
      engine: 3.5,
      ac: 3.5,
      electrical: 3.5,
      steering: 3.5,
    },
  );

  // Documents
  const [documents, setDocuments] = useState(
    initialData?.documents || {
      rcAvailability: false,
      insurance: "no",
      roadTaxPaid: false,
      hypothecation: false,
      other: {
        duplicateKey: false,
        chassisNumber: false,
        partyPeshi: false,
        pollutionNorm: "BSIV",
      },
      registrationAndFitness: {
        manufacturingDate: "",
        registrationDate: "",
        rtoCode: "",
        rtoName: "",
        fitnessExpiry: "",
      },
    },
  );

  // Location
  const [location, setLocation] = useState(
    initialData?.location || {
      address: "",
      lat: undefined,
      lng: undefined,
      city: "",
      state: "",
    },
  );
  const [gettingLocation, setGettingLocation] = useState(false);

  // Component detail states — ALL keys pre-filled with 'ok' as default
  const [exteriorDetails, setExteriorDetails] = useState<
    Record<string, ComponentState>
  >(initialData?.exteriorDetails || buildDefaultSection(EXTERIOR_DETAILS_KEYS));
  const [exteriorPanels, setExteriorPanels] = useState<
    Record<string, ComponentState>
  >(initialData?.exteriorPanels || buildDefaultSection(EXTERIOR_PANELS_KEYS));
  const [tyres, setTyres] = useState<Record<string, ComponentState>>(
    initialData?.tyres || buildDefaultSection(TYRES_KEYS),
  );
  const [windshieldLights, setWindshieldLights] = useState<
    Record<string, ComponentState>
  >(initialData?.windshieldLights || buildDefaultSection(WINDSHIELD_KEYS));
  const [engineDetails, setEngineDetails] = useState<
    Record<string, ComponentState>
  >(initialData?.engineDetails || buildDefaultSection(ENGINE_KEYS));
  const [acDetails, setAcDetails] = useState<Record<string, ComponentState>>(
    initialData?.acDetails || buildDefaultSection(AC_KEYS),
  );
  const [electricalDetails, setElectricalDetails] = useState<
    Record<string, ComponentState>
  >(initialData?.electricalDetails || buildDefaultSection(ELECTRICAL_KEYS));
  const [steeringDetails, setSteeringDetails] = useState<
    Record<string, ComponentState>
  >(initialData?.steeringDetails || buildDefaultSection(STEERING_KEYS));
  const [brakesSuspension, setBrakesSuspension] = useState<
    Record<string, ComponentState>
  >(initialData?.brakesSuspension || buildDefaultSection(BRAKES_KEYS));

  const [componentUploading, setComponentUploading] = useState<
    Record<string, boolean>
  >({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarBasicInput>({
    resolver: zodResolver(carBasicSchema),
    defaultValues: initialData || {
      name: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      fuelType: "petrol",
      transmission: "manual",
      status: "active",
    },
  });

  // ─── Location ──────────────────────────────────────────────────────────────
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation((l: any) => ({
          ...l,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        setGettingLocation(false);
        toast.success("Location captured!");
      },
      () => {
        toast.error("Could not get location");
        setGettingLocation(false);
      },
    );
  };

  // ─── Image upload ──────────────────────────────────────────────────────────
  const handleImageUpload = async (files: FileList, category: string) => {
    setImgUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));
      formData.append("category", category);
      formData.append("carId", carId || "new");

      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        const newImgs = data.files.map((f: any, i: number) => ({
          url: f.url,
          category,
          isPrimary: images.length === 0 && i === 0,
        }));
        setImages((prev) => [...prev, ...newImgs]);
        toast.success(`${data.files.length} file(s) uploaded`);
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    }
    setImgUploading(false);
  };

  // ─── Component media upload ────────────────────────────────────────────────
  const handleComponentUpload = async (
    sectionKey: string,
    componentKey: string,
    files: FileList,
    setter: React.Dispatch<
      React.SetStateAction<Record<string, ComponentState>>
    >,
  ) => {
    setComponentUploading((prev) => ({ ...prev, [componentKey]: true }));
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));
      formData.append("category", sectionKey);
      formData.append("carId", carId || "new");

      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setter((prev) => ({
          ...prev,
          [componentKey]: {
            ...(prev[componentKey] || defaultComponent()),
            media: [
              ...(prev[componentKey]?.media || []),
              ...data.files.map((f: any) => ({
                url: f.url,
                type: f.type as "image" | "video",
              })),
            ],
          },
        }));
      }
    } catch {
      toast.error("Upload failed");
    }
    setComponentUploading((prev) => ({ ...prev, [componentKey]: false }));
  };

  const makeUploadHandler =
    (
      sectionKey: string,
      setter: React.Dispatch<
        React.SetStateAction<Record<string, ComponentState>>
      >,
    ) =>
    async (key: string, files: FileList) =>
      handleComponentUpload(sectionKey, key, files, setter);

  // ─── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (formData: CarBasicInput) => {
    setSaving(true);
    try {
      // Complete payload — everything in one request
      const payload = {
        ...formData,
        location,
        images,
        ratings,
        documents,
        exteriorDetails,
        exteriorPanels,
        tyres,
        windshieldLights,
        engineDetails,
        acDetails,
        electricalDetails,
        steeringDetails,
        brakesSuspension,
      };

      const url = carId ? `/api/cars/${carId}` : "/api/cars";
      const method = carId ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to save car");
        setSaving(false);
        return;
      }

      toast.success(carId ? "Car updated!" : "Car created successfully!");

      const targetId = carId || result.car?.id;
      if (targetId) {
        router.push(`/admin/cars/${targetId}`);
      } else {
        router.push("/admin/cars");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving car");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Basic Info ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
        <h3 className="font-display font-700 text-dark-900 text-lg mb-5 flex items-center gap-2">
          <Car className="w-5 h-5 text-brand-500" /> Basic Information
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "name",
              label: "Car Name *",
              placeholder: "e.g. Hyundai i10 Magna",
            },
            { name: "make", label: "Make *", placeholder: "e.g. Hyundai" },
            { name: "carModel", label: "Model *", placeholder: "e.g. i10" },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">
                {label}
              </label>
              <input
                {...register(name as any)}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
              {errors[name as keyof CarBasicInput] && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors[name as keyof CarBasicInput]?.message)}
                </p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              Year *
            </label>
            <input
              {...register("year", { valueAsNumber: true })}
              type="number"
              min="1950"
              max={new Date().getFullYear() + 1}
              className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              Variant
            </label>
            <input
              {...register("variant")}
              placeholder="e.g. 1.2 Kappa2"
              className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              Color
            </label>
            <input
              {...register("color")}
              placeholder="e.g. Polar White"
              className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              Fuel Type *
            </label>
            <select
              {...register("fuelType")}
              className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 text-sm focus:outline-none focus:border-brand-500 transition-colors capitalize"
            >
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              Transmission *
            </label>
            <select
              {...register("transmission")}
              className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            >
              {TRANSMISSION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              Odometer (km)
            </label>
            <input
              {...register("odometer", { valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="e.g. 45000"
              className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              Market Price (₹)
            </label>
            <input
              {...register("price", { valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="e.g. 250000"
              className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              Asking Price (₹)
            </label>
            <input
              {...register("askingPrice", { valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="e.g. 220000"
              className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="active">Active</option>
              <option value="hold">Hold</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-dark-700 mb-1.5">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Brief description of the car..."
            className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500 transition-colors resize-none"
          />
        </div>
      </div>

      {/* ── Images ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
        <h3 className="font-display font-700 text-dark-900 text-lg mb-5 flex items-center gap-2">
          <Camera className="w-5 h-5 text-brand-500" /> Car Images
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {IMAGE_CATEGORIES.map((cat) => (
            <div key={cat}>
              <p className="text-xs font-medium text-dark-600 capitalize mb-1.5">
                {cat} View
              </p>
              <div className="flex gap-1">
                <label className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-dark-50 border border-dashed border-dark-300 rounded-lg hover:bg-dark-100 text-dark-500 transition-colors cursor-pointer">
                  <Upload className="w-3 h-3" /> Gallery
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && handleImageUpload(e.target.files, cat)
                    }
                  />
                </label>
                <label className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium bg-dark-50 border border-dashed border-dark-300 rounded-lg hover:bg-dark-100 text-dark-500 transition-colors cursor-pointer">
                  <Camera className="w-3 h-3" /> Camera
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && handleImageUpload(e.target.files, cat)
                    }
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        {imgUploading && (
          <div className="flex items-center gap-2 text-dark-500 text-sm mb-3">
            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />{" "}
            Uploading...
          </div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-lg overflow-hidden bg-dark-100 group"
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5 truncate px-1 capitalize">
                  {img.category}
                </div>
                {img.isPrimary && (
                  <div className="absolute top-1 left-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                )}
                {!img.isPrimary && (
                  <button
                    type="button"
                    title="Set as primary"
                    onClick={() =>
                      setImages((prev) =>
                        prev.map((im, j) => ({ ...im, isPrimary: j === i })),
                      )
                    }
                    className="absolute top-1 left-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Location ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
        <h3 className="font-display font-700 text-dark-900 text-lg mb-5 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-500" /> Location
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              Address
            </label>
            <input
              value={location.address}
              onChange={(e) =>
                setLocation((l: any) => ({ ...l, address: e.target.value }))
              }
              placeholder="Full address"
              className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              City
            </label>
            <input
              value={location.city}
              onChange={(e) =>
                setLocation((l: any) => ({ ...l, city: e.target.value }))
              }
              placeholder="e.g. New Delhi"
              className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              State
            </label>
            <input
              value={location.state}
              onChange={(e) =>
                setLocation((l: any) => ({ ...l, state: e.target.value }))
              }
              placeholder="e.g. Delhi"
              className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={gettingLocation}
            className="flex items-center gap-2 bg-brand-50 text-brand-700 border border-brand-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-100 disabled:opacity-50 transition-colors"
          >
            {gettingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            {gettingLocation
              ? "Getting location..."
              : "Use My Current Location"}
          </button>
          {location.lat && location.lng && (
            <span className="text-xs text-green-600 font-medium">
              ✓ Location set ({Number(location.lat).toFixed(4)},{" "}
              {Number(location.lng).toFixed(4)})
            </span>
          )}
        </div>
      </div>

      {/* ── Ratings ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
        <h3 className="font-display font-700 text-dark-900 text-lg mb-5 flex items-center gap-2">
          <Star className="w-5 h-5 text-brand-500" /> Inspection Ratings (out of
          5)
        </h3>
        <div className="space-y-4">
          {[
            { key: "exterior", label: "Exterior", icon: "🚗" },
            { key: "engine", label: "Engine", icon: "⚙️" },
            { key: "ac", label: "Air Conditioning", icon: "❄️" },
            { key: "electrical", label: "Electrical", icon: "⚡" },
            { key: "steering", label: "Steering", icon: "🎯" },
          ].map(({ key, label, icon }) => (
            <div key={key} className="flex items-center gap-4">
              <span className="text-xl w-7">{icon}</span>
              <span className="text-sm font-medium text-dark-700 w-32 flex-shrink-0">
                {label}
              </span>
              <div className="flex gap-1 flex-wrap">
                {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setRatings((r: any) => ({ ...r, [key]: val }))
                    }
                    className={`w-9 h-8 rounded-lg text-xs font-bold transition-all ${
                      ratings[key] >= val
                        ? "bg-amber-400 text-white shadow-sm"
                        : "bg-dark-100 text-dark-400 hover:bg-amber-100"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <span className="text-brand-600 font-bold text-sm ml-2">
                {ratings[key]}/5
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Documents ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
        <h3 className="font-display font-700 text-dark-900 text-lg mb-5 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-500" /> Documents
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {[
            { key: "rcAvailability", label: "RC Available" },
            { key: "roadTaxPaid", label: "Road Tax Paid" },
            { key: "hypothecation", label: "Hypothecation" },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-dark-50 rounded-xl"
            >
              <span className="text-sm font-medium text-dark-700">{label}</span>
              <button
                type="button"
                onClick={() =>
                  setDocuments((d: any) => ({ ...d, [key]: !d[key] }))
                }
                className={`relative w-11 h-6 rounded-full transition-colors ${documents[key] ? "bg-green-500" : "bg-dark-200"}`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${documents[key] ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between p-3 bg-dark-50 rounded-xl">
            <span className="text-sm font-medium text-dark-700">Insurance</span>
            <select
              value={documents.insurance}
              onChange={(e) =>
                setDocuments((d: any) => ({ ...d, insurance: e.target.value }))
              }
              className="text-sm bg-white border border-dark-200 rounded-lg px-2 py-1 focus:outline-none focus:border-brand-500"
            >
              <option value="yes">Valid</option>
              <option value="no">None</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <h4 className="font-semibold text-dark-800 mb-3">Other Information</h4>
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {[
            { key: "duplicateKey", label: "Duplicate Key" },
            { key: "chassisNumber", label: "Chassis Number" },
            { key: "partyPeshi", label: "Party-Peshi" },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-dark-50 rounded-xl"
            >
              <span className="text-sm font-medium text-dark-700">{label}</span>
              <button
                type="button"
                onClick={() =>
                  setDocuments((d: any) => ({
                    ...d,
                    other: { ...d.other, [key]: !d.other[key] },
                  }))
                }
                className={`relative w-11 h-6 rounded-full transition-colors ${documents.other?.[key] ? "bg-green-500" : "bg-dark-200"}`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${documents.other?.[key] ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between p-3 bg-dark-50 rounded-xl">
            <span className="text-sm font-medium text-dark-700">
              Pollution Norm
            </span>
            <select
              value={documents.other?.pollutionNorm || "BSIV"}
              onChange={(e) =>
                setDocuments((d: any) => ({
                  ...d,
                  other: { ...d.other, pollutionNorm: e.target.value },
                }))
              }
              className="text-sm bg-white border border-dark-200 rounded-lg px-2 py-1 focus:outline-none focus:border-brand-500"
            >
              {["BSIII", "BSIV", "BSVI"].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <h4 className="font-semibold text-dark-800 mb-3">
          Registration & Fitness
        </h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              key: "manufacturingDate",
              label: "Manufacturing Date",
              type: "month",
            },
            {
              key: "registrationDate",
              label: "Registration Date",
              type: "month",
            },
            { key: "fitnessExpiry", label: "Fitness Expiry", type: "date" },
            { key: "rtoCode", label: "RTO Code", type: "text" },
            { key: "rtoName", label: "RTO Name", type: "text" },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-dark-600 mb-1">
                {label}
              </label>
              <input
                type={type}
                value={documents.registrationAndFitness?.[key] || ""}
                onChange={(e) =>
                  setDocuments((d: any) => ({
                    ...d,
                    registrationAndFitness: {
                      ...d.registrationAndFitness,
                      [key]: e.target.value,
                    },
                  }))
                }
                className="w-full px-3 py-2 bg-dark-50 border border-dark-200 rounded-xl text-sm text-dark-900 focus:outline-none focus:border-brand-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Condition Details ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6 space-y-3">
        <div className="mb-2">
          <h3 className="font-display font-700 text-dark-900 text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand-500" /> Condition
            Details
          </h3>
          <div className="flex items-center gap-4 mt-2 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-green-600">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />{" "}
              OK
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />{" "}
              Repaired
            </span>
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />{" "}
              Not OK
            </span>
          </div>
        </div>

        <ComponentSection
          title="Exterior Details"
          fields={[
            { key: "apron", label: "Apron" },
            { key: "pillar", label: "Pillar" },
            { key: "cowlTop", label: "Cowl Top" },
            { key: "dicky", label: "Dicky" },
            { key: "leftQuarterPanel", label: "Left Quarter Panel" },
            { key: "rightQuarterPanel", label: "Right Quarter Panel" },
            { key: "firewall", label: "Firewall" },
            { key: "lowerMember", label: "Lower Member" },
            { key: "leftRunningBoard", label: "Left Running Board" },
            { key: "headlightSupports", label: "Headlight Supports" },
            { key: "upperMember", label: "Upper Member (Bonnet Patti)" },
            { key: "rightRunningBoard", label: "Right Running Board" },
          ]}
          values={exteriorDetails}
          onChange={(k, v) =>
            setExteriorDetails((prev) => ({ ...prev, [k]: v }))
          }
          onUpload={makeUploadHandler("exterior", setExteriorDetails)}
          uploading={componentUploading}
        />

        <ComponentSection
          title="Exterior Panels"
          fields={[
            { key: "roof", label: "Roof" },
            { key: "bonnet", label: "Bonnet" },
            { key: "dickeyDoor", label: "Dicky Door" },
            { key: "rearBumper", label: "Rear Bumper" },
            { key: "frontBumper", label: "Front Bumper" },
            { key: "leftFender", label: "Left Fender" },
            { key: "rightFender", label: "Right Fender" },
            { key: "rearLeftDoor", label: "Rear Left Door" },
            { key: "frontLeftDoor", label: "Front Left Door" },
            { key: "rearRightDoor", label: "Rear Right Door" },
            { key: "frontRightDoor", label: "Front Right Door" },
          ]}
          values={exteriorPanels}
          onChange={(k, v) =>
            setExteriorPanels((prev) => ({ ...prev, [k]: v }))
          }
          onUpload={makeUploadHandler("panels", setExteriorPanels)}
          uploading={componentUploading}
        />

        <ComponentSection
          title="Tyres"
          fields={[
            { key: "frontLeft", label: "Front Left Tyre" },
            { key: "frontRight", label: "Front Right Tyre" },
            { key: "rearLeft", label: "Rear Left Tyre" },
            { key: "rearRight", label: "Rear Right Tyre" },
            { key: "spare", label: "Spare Tyre" },
          ]}
          values={tyres}
          onChange={(k, v) => setTyres((prev) => ({ ...prev, [k]: v }))}
          onUpload={makeUploadHandler("tyres", setTyres)}
          uploading={componentUploading}
        />

        <ComponentSection
          title="Windshield & Lights"
          fields={[
            { key: "headlights", label: "Headlights" },
            { key: "tailLights", label: "Tail Lights" },
            { key: "windshield", label: "Windshield" },
            { key: "leftSvm", label: "Left SVM (Side View Mirror)" },
            { key: "rightSvm", label: "Right SVM" },
            { key: "leftHeadlight", label: "Left Headlight" },
            { key: "rightHeadlight", label: "Right Headlight" },
            { key: "leftTailLight", label: "Left Tail Light" },
            { key: "rightTailLight", label: "Right Tail Light" },
          ]}
          values={windshieldLights}
          onChange={(k, v) =>
            setWindshieldLights((prev) => ({ ...prev, [k]: v }))
          }
          onUpload={makeUploadHandler("lights", setWindshieldLights)}
          uploading={componentUploading}
        />

        <ComponentSection
          title="Engine Details"
          fields={[
            { key: "exhaustSmoke", label: "Exhaust Smoke" },
            { key: "engineMounting", label: "Engine Mounting" },
            { key: "clutch", label: "Clutch" },
            { key: "engine", label: "Engine" },
            { key: "engineSound", label: "Engine Sound" },
            { key: "battery", label: "Battery" },
            { key: "coolingSystem", label: "Cooling System" },
            { key: "engineOil", label: "Engine Oil" },
            { key: "gearShifting", label: "Gear Shifting / Transmission" },
          ]}
          values={engineDetails}
          onChange={(k, v) => setEngineDetails((prev) => ({ ...prev, [k]: v }))}
          onUpload={makeUploadHandler("engine", setEngineDetails)}
          uploading={componentUploading}
        />

        <ComponentSection
          title="Air Conditioning"
          fields={[
            { key: "cooling", label: "Cooling" },
            { key: "compressor", label: "Compressor" },
            { key: "condenser", label: "Condenser" },
            { key: "blower", label: "Blower" },
            { key: "controls", label: "Controls" },
          ]}
          values={acDetails}
          onChange={(k, v) => setAcDetails((prev) => ({ ...prev, [k]: v }))}
          onUpload={makeUploadHandler("ac", setAcDetails)}
          uploading={componentUploading}
        />

        <ComponentSection
          title="Electrical"
          fields={[
            { key: "musicSystem", label: "Music System" },
            { key: "powerWindows", label: "Power Windows" },
            { key: "centralLocking", label: "Central Locking" },
            { key: "horn", label: "Horn" },
            { key: "wipers", label: "Wipers" },
            { key: "rearDefogger", label: "Rear Defogger" },
            { key: "powerSteering", label: "Power Steering" },
            { key: "instruments", label: "Instruments" },
          ]}
          values={electricalDetails}
          onChange={(k, v) =>
            setElectricalDetails((prev) => ({ ...prev, [k]: v }))
          }
          onUpload={makeUploadHandler("electrical", setElectricalDetails)}
          uploading={componentUploading}
        />

        <ComponentSection
          title="Steering"
          fields={[
            { key: "steering", label: "Steering" },
            { key: "alignment", label: "Alignment" },
          ]}
          values={steeringDetails}
          onChange={(k, v) =>
            setSteeringDetails((prev) => ({ ...prev, [k]: v }))
          }
          onUpload={makeUploadHandler("steering", setSteeringDetails)}
          uploading={componentUploading}
        />

        <ComponentSection
          title="Brakes & Suspension"
          fields={[
            { key: "frontBrakes", label: "Front Brakes" },
            { key: "rearBrakes", label: "Rear Brakes" },
            { key: "handbrake", label: "Handbrake" },
            { key: "frontSuspension", label: "Front Suspension" },
            { key: "rearSuspension", label: "Rear Suspension" },
          ]}
          values={brakesSuspension}
          onChange={(k, v) =>
            setBrakesSuspension((prev) => ({ ...prev, [k]: v }))
          }
          onUpload={makeUploadHandler("brakes", setBrakesSuspension)}
          uploading={componentUploading}
        />
      </div>

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end pb-6">
        <button
          type="button"
          onClick={() => router.push("/admin/cars")}
          className="px-6 py-3 border border-dark-200 text-dark-600 rounded-xl font-semibold hover:bg-dark-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-brand-gradient text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity shadow-lg"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "Saving..." : carId ? "Update Car" : "Create Car"}
        </button>
      </div>
    </form>
  );
}
