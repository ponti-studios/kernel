import { defineTemplateReferences } from "../../reference-bundle.js";
import animationDerivedValueReference from "./references/animation-derived-value.md";
import animationGestureDetectorPressReference from "./references/animation-gesture-detector-press.md";
import animationGpuPropertiesReference from "./references/animation-gpu-properties.md";
import designSystemCompoundComponentsReference from "./references/design-system-compound-components.md";
import expoAnimationsReference from "./references/expo-animations.md";
import expoControlsReference from "./references/expo-controls.md";
import expoFormSheetReference from "./references/expo-form-sheet.md";
import expoGradientsReference from "./references/expo-gradients.md";
import expoIconsReference from "./references/expo-icons.md";
import expoMediaReference from "./references/expo-media.md";
import expoRouteStructureReference from "./references/expo-route-structure.md";
import expoSearchReference from "./references/expo-search.md";
import expoStorageReference from "./references/expo-storage.md";
import expoTabsReference from "./references/expo-tabs.md";
import expoToolbarAndHeadersReference from "./references/expo-toolbar-and-headers.md";
import expoVisualEffectsReference from "./references/expo-visual-effects.md";
import expoWebgpuThreeReference from "./references/expo-webgpu-three.md";
import expoZoomTransitionsReference from "./references/expo-zoom-transitions.md";
import fontsConfigPluginReference from "./references/fonts-config-plugin.md";
import importsDesignSystemFolderReference from "./references/imports-design-system-folder.md";
import jsHoistIntlReference from "./references/js-hoist-intl.md";
import listPerformanceCallbacksReference from "./references/list-performance-callbacks.md";
import listPerformanceFunctionReferencesReference from "./references/list-performance-function-references.md";
import listPerformanceImagesReference from "./references/list-performance-images.md";
import listPerformanceInlineObjectsReference from "./references/list-performance-inline-objects.md";
import listPerformanceItemExpensiveReference from "./references/list-performance-item-expensive.md";
import listPerformanceItemMemoReference from "./references/list-performance-item-memo.md";
import listPerformanceItemTypesReference from "./references/list-performance-item-types.md";
import listPerformanceVirtualizeReference from "./references/list-performance-virtualize.md";
import monorepoNativeDepsInAppReference from "./references/monorepo-native-deps-in-app.md";
import monorepoSingleDependencyVersionsReference from "./references/monorepo-single-dependency-versions.md";
import navigationNativeNavigatorsReference from "./references/navigation-native-navigators.md";
import reactCompilerDestructureFunctionsReference from "./references/react-compiler-destructure-functions.md";
import reactCompilerReanimatedSharedValuesReference from "./references/react-compiler-reanimated-shared-values.md";
import reactStateDispatcherReference from "./references/react-state-dispatcher.md";
import reactStateFallbackReference from "./references/react-state-fallback.md";
import reactStateMinimizeReference from "./references/react-state-minimize.md";
import renderingNoFalsyAndReference from "./references/rendering-no-falsy-and.md";
import renderingTextInTextComponentReference from "./references/rendering-text-in-text-component.md";
import scrollPositionNoStateReference from "./references/scroll-position-no-state.md";
import stateGroundTruthReference from "./references/state-ground-truth.md";
import uiExpoImageReference from "./references/ui-expo-image.md";
import uiImageGalleryReference from "./references/ui-image-gallery.md";
import uiMeasureViewsReference from "./references/ui-measure-views.md";
import uiMenusReference from "./references/ui-menus.md";
import uiNativeModalsReference from "./references/ui-native-modals.md";
import uiPressableReference from "./references/ui-pressable.md";
import uiSafeAreaScrollReference from "./references/ui-safe-area-scroll.md";
import uiScrollviewContentInsetReference from "./references/ui-scrollview-content-inset.md";
import uiStylingReference from "./references/ui-styling.md";

export const REACT_NATIVE_SKILL_REFERENCES = defineTemplateReferences(
  ["references/expo-route-structure.md", expoRouteStructureReference],
  ["references/expo-animations.md", expoAnimationsReference],
  ["references/expo-controls.md", expoControlsReference],
  ["references/expo-form-sheet.md", expoFormSheetReference],
  ["references/expo-gradients.md", expoGradientsReference],
  ["references/expo-icons.md", expoIconsReference],
  ["references/expo-media.md", expoMediaReference],
  ["references/expo-search.md", expoSearchReference],
  ["references/expo-storage.md", expoStorageReference],
  ["references/expo-tabs.md", expoTabsReference],
  ["references/expo-toolbar-and-headers.md", expoToolbarAndHeadersReference],
  ["references/expo-visual-effects.md", expoVisualEffectsReference],
  ["references/expo-webgpu-three.md", expoWebgpuThreeReference],
  ["references/expo-zoom-transitions.md", expoZoomTransitionsReference],
  ["references/animation-derived-value.md", animationDerivedValueReference],
  ["references/animation-gesture-detector-press.md", animationGestureDetectorPressReference],
  ["references/animation-gpu-properties.md", animationGpuPropertiesReference],
  ["references/design-system-compound-components.md", designSystemCompoundComponentsReference],
  ["references/fonts-config-plugin.md", fontsConfigPluginReference],
  ["references/imports-design-system-folder.md", importsDesignSystemFolderReference],
  ["references/js-hoist-intl.md", jsHoistIntlReference],
  ["references/list-performance-callbacks.md", listPerformanceCallbacksReference],
  ["references/list-performance-function-references.md", listPerformanceFunctionReferencesReference],
  ["references/list-performance-images.md", listPerformanceImagesReference],
  ["references/list-performance-inline-objects.md", listPerformanceInlineObjectsReference],
  ["references/list-performance-item-expensive.md", listPerformanceItemExpensiveReference],
  ["references/list-performance-item-memo.md", listPerformanceItemMemoReference],
  ["references/list-performance-item-types.md", listPerformanceItemTypesReference],
  ["references/list-performance-virtualize.md", listPerformanceVirtualizeReference],
  ["references/monorepo-native-deps-in-app.md", monorepoNativeDepsInAppReference],
  ["references/monorepo-single-dependency-versions.md", monorepoSingleDependencyVersionsReference],
  ["references/navigation-native-navigators.md", navigationNativeNavigatorsReference],
  ["references/react-compiler-destructure-functions.md", reactCompilerDestructureFunctionsReference],
  ["references/react-compiler-reanimated-shared-values.md", reactCompilerReanimatedSharedValuesReference],
  ["references/react-state-dispatcher.md", reactStateDispatcherReference],
  ["references/react-state-fallback.md", reactStateFallbackReference],
  ["references/react-state-minimize.md", reactStateMinimizeReference],
  ["references/rendering-no-falsy-and.md", renderingNoFalsyAndReference],
  ["references/rendering-text-in-text-component.md", renderingTextInTextComponentReference],
  ["references/scroll-position-no-state.md", scrollPositionNoStateReference],
  ["references/state-ground-truth.md", stateGroundTruthReference],
  ["references/ui-expo-image.md", uiExpoImageReference],
  ["references/ui-image-gallery.md", uiImageGalleryReference],
  ["references/ui-measure-views.md", uiMeasureViewsReference],
  ["references/ui-menus.md", uiMenusReference],
  ["references/ui-native-modals.md", uiNativeModalsReference],
  ["references/ui-pressable.md", uiPressableReference],
  ["references/ui-safe-area-scroll.md", uiSafeAreaScrollReference],
  ["references/ui-scrollview-content-inset.md", uiScrollviewContentInsetReference],
  ["references/ui-styling.md", uiStylingReference],
);