import type { ComponentType } from "react";
import type { ShowroomSlug } from "@/content/showroom";
import type { DemoProps } from "./DemoRoot";
import { AutoDetailingDemo } from "./AutoDetailingDemo";
import { BarbershopDemo } from "./BarbershopDemo";
import { BeautySpaDemo } from "./BeautySpaDemo";
import { BoutiqueEcommerceDemo } from "./BoutiqueEcommerceDemo";
import { CafeHospitalityDemo } from "./CafeHospitalityDemo";
import { CleaningServicesDemo } from "./CleaningServicesDemo";
import { ConsultingDemo } from "./ConsultingDemo";
import { FineDiningDemo } from "./FineDiningDemo";
import { FitnessStudioDemo } from "./FitnessStudioDemo";
import { LandscapingDemo } from "./LandscapingDemo";
import { PetGroomingDemo } from "./PetGroomingDemo";
import { PlumbingTradesDemo } from "./PlumbingTradesDemo";

// One component per showroom slug. A missing or extra entry is a type error.
export const showroomDemos: Record<ShowroomSlug, ComponentType<DemoProps>> = {
  barbershop: BarbershopDemo,
  "beauty-salon": BeautySpaDemo,
  "auto-detailing": AutoDetailingDemo,
  cafe: CafeHospitalityDemo,
  "plumbing-trades": PlumbingTradesDemo,
  "pet-grooming": PetGroomingDemo,
  landscaping: LandscapingDemo,
  "fitness-studio": FitnessStudioDemo,
  "fine-dining": FineDiningDemo,
  "cleaning-services": CleaningServicesDemo,
  "boutique-ecommerce": BoutiqueEcommerceDemo,
  consulting: ConsultingDemo,
};
