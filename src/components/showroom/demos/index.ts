import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { ShowroomSlug } from "@/content/showroom";
import type { DemoProps } from "./DemoRoot";

type DemoComponent = LazyExoticComponent<ComponentType<DemoProps>>;

// Lightweight metadata stays in content/showroom. Each implementation becomes its own chunk and
// loads only when a gallery preview approaches the viewport or a full demo opens it.
export const showroomDemos: Record<ShowroomSlug, DemoComponent> = {
  barbershop: lazy(() =>
    import("./BarbershopDemo").then((module) => ({ default: module.BarbershopDemo })),
  ),
  "beauty-salon": lazy(() =>
    import("./BeautySpaDemo").then((module) => ({ default: module.BeautySpaDemo })),
  ),
  "auto-detailing": lazy(() =>
    import("./AutoDetailingDemo").then((module) => ({ default: module.AutoDetailingDemo })),
  ),
  cafe: lazy(() =>
    import("./CafeHospitalityDemo").then((module) => ({ default: module.CafeHospitalityDemo })),
  ),
  "plumbing-trades": lazy(() =>
    import("./PlumbingTradesDemo").then((module) => ({ default: module.PlumbingTradesDemo })),
  ),
  "pet-grooming": lazy(() =>
    import("./PetGroomingDemo").then((module) => ({ default: module.PetGroomingDemo })),
  ),
  landscaping: lazy(() =>
    import("./LandscapingDemo").then((module) => ({ default: module.LandscapingDemo })),
  ),
  "fitness-studio": lazy(() =>
    import("./FitnessStudioDemo").then((module) => ({ default: module.FitnessStudioDemo })),
  ),
  "fine-dining": lazy(() =>
    import("./FineDiningDemo").then((module) => ({ default: module.FineDiningDemo })),
  ),
  "cleaning-services": lazy(() =>
    import("./CleaningServicesDemo").then((module) => ({ default: module.CleaningServicesDemo })),
  ),
  "boutique-ecommerce": lazy(() =>
    import("./BoutiqueEcommerceDemo").then((module) => ({
      default: module.BoutiqueEcommerceDemo,
    })),
  ),
  consulting: lazy(() =>
    import("./ConsultingDemo").then((module) => ({ default: module.ConsultingDemo })),
  ),
};
