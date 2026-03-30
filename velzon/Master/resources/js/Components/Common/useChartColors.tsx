import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import getChartColorsArray from './DynamicChartsColor';

const useChartColors = (chartId: any) => {
  const [chartColors, setChartColors] = useState<string[]>([]);

  const selectLayoutProperties = createSelector(
    (state : any) => state.Layout,
    (layout: any) => ({
      layoutThemeType: layout.layoutThemeType,
      layoutThemeColorType: layout.layoutThemeColorType
    })
    
  );
  // Inside your component
  const {layoutThemeType, layoutThemeColorType} : any = useSelector(selectLayoutProperties);

  useEffect(() => {
    const colors = getChartColorsArray(chartId);
    setChartColors(colors);
  }, [chartId, layoutThemeType, layoutThemeColorType]);

  return chartColors;
};

export default useChartColors;
