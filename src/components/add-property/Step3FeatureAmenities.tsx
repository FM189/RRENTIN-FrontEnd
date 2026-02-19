"use client";

import { useTranslations } from "next-intl";
import { MultiSelect } from "@/components/ui";
import { AddPropertyData } from "@/types/property";

interface Step3Props {
  formData: AddPropertyData;
  onFormDataChange: (updates: Partial<AddPropertyData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step3FeatureAmenities({
  formData,
  onFormDataChange,
  onNext,
  onPrevious,
}: Step3Props) {
  const t = useTranslations("Dashboard.properties.addPropertyPage");
  const placeholder = t("selectPlaceholder");
  const customPlaceholder = t("step3.customFeaturePlaceholder");

  const propertyFeatureOptions = [
    "private_gym", "private_lift", "private_sauna", "jacuzzi_hot_tub",
    "corner_unit", "maids_quarters", "duplex", "penthouse",
    "full_western_kitchen", "bathtub", "fully_renovated", "renovated_kitchen",
    "renovated_bathroom", "smart_home", "media_room", "balcony_terrace",
    "add_others",
  ].map((key) => ({ value: key, label: t(`step3.propertyFeatureOptions.${key}`) }));

  const amenityOptions = [
    "rooftop_terrace", "terrace", "outdoor_showers", "swimming_pool",
    "gym", "pet_area", "garden", "jacuzzi", "ev_charging", "spa",
    "cinema", "smart_building", "co_working_space", "retail_stores",
    "rooftop_deck", "balcony", "concierge", "community_garden",
    "laundry_amenities", "reading_area", "automated_parking",
    "covered_parking", "open_parking", "smart_appliances", "green_space",
    "add_others",
  ].map((key) => ({ value: key, label: t(`step3.amenityOptions.${key}`) }));

  const securityOptions = [
    "24_7_security", "cctv", "key_card_access", "video_intercom",
    "fire_alarm", "smoke_detector", "security_alarm", "add_others",
  ].map((key) => ({ value: key, label: t(`step3.securityOptions.${key}`) }));

  const rentalFeatureOptions = [
    "high_speed_internet", "microwave", "oven", "tv", "cable_tv",
    "air_conditioning", "dishwasher", "refrigerator", "add_others",
  ].map((key) => ({ value: key, label: t(`step3.rentalFeatureOptions.${key}`) }));

  const viewOptions = [
    "blocked_view", "unblocked_view", "panorama_view", "skyline_view",
    "city_view", "river_canal_view", "pool_view", "garden_view",
    "park_view", "courtyard_view", "lake_view", "golf_course_view",
    "street_view", "sunset_view", "sunrise_view", "beach_view",
    "add_others",
  ].map((key) => ({ value: key, label: t(`step3.viewOptions.${key}`) }));

  const makeHandlers = (
    field: keyof AddPropertyData,
    customField: keyof AddPropertyData
  ) => ({
    onChange: (selected: string[]) =>
      onFormDataChange({
        [field]: selected,
        ...(!selected.includes("add_others") && { [customField]: [] }),
      }),
    allowCustom: ((formData[field] as string[]) || []).includes("add_others"),
    customItems: (formData[customField] as string[]) || [],
    onAddCustom: (item: string) =>
      onFormDataChange({
        [customField]: [...((formData[customField] as string[]) || []), item],
      }),
    onRemoveCustom: (item: string) =>
      onFormDataChange({
        [customField]: ((formData[customField] as string[]) || []).filter(
          (v: string) => v !== item
        ),
      }),
  });

  const featureHandlers = makeHandlers("propertyFeatures", "customFeatures");
  const amenityHandlers = makeHandlers("amenities", "customAmenities");
  const securityHandlers = makeHandlers("securityFeatures", "customSecurity");
  const rentalHandlers = makeHandlers("rentalFeatures", "customRentalFeatures");
  const viewHandlers = makeHandlers("propertyViews", "customViews");

  return (
    <>
      <h2 className="text-base lg:text-lg font-medium capitalize text-heading">
        {t("step3.sectionTitle")}
      </h2>

      <div className="w-full flex flex-col gap-4 lg:gap-5">
        {/* Row: Property Feature / Amenities */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="flex-1">
            <MultiSelect
              label={t("step3.propertyFeature")}
              options={propertyFeatureOptions}
              value={formData.propertyFeatures}
              placeholder={placeholder}
              customPlaceholder={customPlaceholder}
              {...featureHandlers}
            />
          </div>
          <div className="flex-1">
            <MultiSelect
              label={t("step3.amenities")}
              options={amenityOptions}
              value={formData.amenities}
              placeholder={placeholder}
              customPlaceholder={customPlaceholder}
              {...amenityHandlers}
            />
          </div>
        </div>

        {/* Row: Security / Rental Feature */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="flex-1">
            <MultiSelect
              label={t("step3.security")}
              options={securityOptions}
              value={formData.securityFeatures}
              placeholder={placeholder}
              customPlaceholder={customPlaceholder}
              {...securityHandlers}
            />
          </div>
          <div className="flex-1">
            <MultiSelect
              label={t("step3.rentalFeature")}
              options={rentalFeatureOptions}
              value={formData.rentalFeatures}
              placeholder={placeholder}
              customPlaceholder={customPlaceholder}
              {...rentalHandlers}
            />
          </div>
        </div>

        {/* View from the property — half width */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <div className="flex-1">
            <MultiSelect
              label={t("step3.viewFromProperty")}
              options={viewOptions}
              value={formData.propertyViews}
              placeholder={placeholder}
              customPlaceholder={customPlaceholder}
              {...viewHandlers}
            />
          </div>
          <div className="flex-1" />
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="w-full flex justify-end gap-3">
        <button
          type="button"
          onClick={onPrevious}
          className="px-5 py-2.5 bg-[rgba(124,132,141,0.7)] text-white text-base font-medium rounded hover:bg-[rgba(124,132,141,0.9)] transition-colors"
        >
          {t("previous")}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2.5 bg-primary text-white text-base font-medium rounded hover:bg-primary-hover transition-colors"
        >
          {t("next")}
        </button>
      </div>
    </>
  );
}
