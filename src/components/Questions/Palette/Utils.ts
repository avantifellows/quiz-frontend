// classes for the icon of each key in the legend of the question palette
export const legendKeyIconClass =
  "w-6 h-6 bp-420:w-10 bp-420:h-10 border-1 rounded-md place-self-center flex-shrink-0";
// classes for the text of each key in the legend of the question palette
export const legendKeyTextClass =
  "place-self-center text-sm sm:text-base font-bold";
// classes for the container of each key in the legend of the question palette
export const legendKeyContainerClass = "flex space-x-2 lg:space-x-4 items-center";

// Palette tiles and the palette's legend share these per-state styles.
// In progress the fill is the question's status; after the quiz it is the result,
// and the corner badge repeats it as an icon so colour isn't the only signal.
export const paletteTileStateClass: Record<string, string> = {
  success: "bg-emerald-300 border-emerald-500",
  error: "bg-red-300 border-red-500",
  neutral: "bg-gray-100 border-gray-500",
  review: "bg-violet-300 border-violet-600",
};
export const paletteTileEndedStateClass: Record<string, string> = {
  success: "bg-emerald-100 border-emerald-500",
  error: "bg-red-100 border-red-500",
  neutral: "bg-yellow-50 border-yellow-400",
  "partial-success": "bg-blue-100 border-blue-500",
};
export const paletteEndedBadgeIcon: Record<string, string> = {
  success: "correct-rounded",
  error: "wrong-rounded",
  neutral: "skip-rounded",
  "partial-success": "partially-correct-rounded",
};
