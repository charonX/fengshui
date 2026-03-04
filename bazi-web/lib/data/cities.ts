/**
 * 中国主要城市经纬度数据库
 * 用于真太阳时校正
 *
 * 经度说明：
 * - 东经为正，西经为负
 * - 中国城市经度范围大约在 73°E - 135°E
 */

export interface City {
  name: string;
  province: string;
  longitude: number; // 东经
  latitude: number;  // 北纬
}

/**
 * 中国主要城市列表（按省份分组）
 * 经度用于真太阳时校正：每差 1 度，时间差 4 分钟
 */
export const CITIES: City[] = [
  // 直辖市
  { name: '北京', province: '北京', longitude: 116.4, latitude: 39.9 },
  { name: '天津', province: '天津', longitude: 117.2, latitude: 39.1 },
  { name: '上海', province: '上海', longitude: 121.5, latitude: 31.2 },
  { name: '重庆', province: '重庆', longitude: 106.5, latitude: 29.5 },

  // 河北省
  { name: '石家庄', province: '河北', longitude: 114.5, latitude: 38.0 },
  { name: '唐山', province: '河北', longitude: 118.2, latitude: 39.6 },
  { name: '保定', province: '河北', longitude: 115.5, latitude: 38.9 },
  { name: '邯郸', province: '河北', longitude: 114.5, latitude: 36.6 },

  // 山西省
  { name: '太原', province: '山西', longitude: 112.5, latitude: 37.9 },
  { name: '大同', province: '山西', longitude: 113.3, latitude: 40.1 },

  // 内蒙古自治区
  { name: '呼和浩特', province: '内蒙古', longitude: 111.7, latitude: 40.8 },
  { name: '包头', province: '内蒙古', longitude: 109.8, latitude: 40.6 },

  // 辽宁省
  { name: '沈阳', province: '辽宁', longitude: 123.4, latitude: 41.8 },
  { name: '大连', province: '辽宁', longitude: 121.6, latitude: 38.9 },

  // 吉林省
  { name: '长春', province: '吉林', longitude: 125.3, latitude: 43.8 },
  { name: '吉林', province: '吉林', longitude: 126.5, latitude: 43.8 },

  // 黑龙江省
  { name: '哈尔滨', province: '黑龙江', longitude: 126.6, latitude: 45.8 },
  { name: '大庆', province: '黑龙江', longitude: 125.1, latitude: 46.6 },

  // 江苏省
  { name: '南京', province: '江苏', longitude: 118.8, latitude: 32.1 },
  { name: '苏州', province: '江苏', longitude: 120.6, latitude: 31.3 },
  { name: '无锡', province: '江苏', longitude: 120.3, latitude: 31.6 },
  { name: '徐州', province: '江苏', longitude: 117.2, latitude: 34.3 },

  // 浙江省
  { name: '杭州', province: '浙江', longitude: 120.2, latitude: 30.3 },
  { name: '宁波', province: '浙江', longitude: 121.6, latitude: 29.9 },
  { name: '温州', province: '浙江', longitude: 120.7, latitude: 28.0 },

  // 安徽省
  { name: '合肥', province: '安徽', longitude: 117.3, latitude: 31.9 },
  { name: '芜湖', province: '安徽', longitude: 118.4, latitude: 31.3 },

  // 福建省
  { name: '福州', province: '福建', longitude: 119.3, latitude: 26.1 },
  { name: '厦门', province: '福建', longitude: 118.1, latitude: 24.5 },
  { name: '泉州', province: '福建', longitude: 118.6, latitude: 24.9 },

  // 江西省
  { name: '南昌', province: '江西', longitude: 115.9, latitude: 28.7 },
  { name: '赣州', province: '江西', longitude: 114.9, latitude: 25.8 },

  // 山东省
  { name: '济南', province: '山东', longitude: 117.0, latitude: 36.7 },
  { name: '青岛', province: '山东', longitude: 120.4, latitude: 36.1 },
  { name: '烟台', province: '山东', longitude: 121.4, latitude: 37.5 },

  // 河南省
  { name: '郑州', province: '河南', longitude: 113.6, latitude: 34.8 },
  { name: '洛阳', province: '河南', longitude: 112.4, latitude: 34.6 },
  { name: '开封', province: '河南', longitude: 114.3, latitude: 34.8 },

  // 湖北省
  { name: '武汉', province: '湖北', longitude: 114.3, latitude: 30.6 },
  { name: '宜昌', province: '湖北', longitude: 111.3, latitude: 30.7 },

  // 湖南省
  { name: '长沙', province: '湖南', longitude: 113.0, latitude: 28.2 },
  { name: '株洲', province: '湖南', longitude: 113.1, latitude: 27.8 },

  // 广东省
  { name: '广州', province: '广东', longitude: 113.3, latitude: 23.1 },
  { name: '深圳', province: '广东', longitude: 114.1, latitude: 22.5 },
  { name: '珠海', province: '广东', longitude: 113.6, latitude: 22.3 },
  { name: '汕头', province: '广东', longitude: 116.7, latitude: 23.4 },
  { name: '佛山', province: '广东', longitude: 113.1, latitude: 23.0 },

  // 广西壮族自治区
  { name: '南宁', province: '广西', longitude: 108.3, latitude: 22.8 },
  { name: '桂林', province: '广西', longitude: 110.3, latitude: 25.3 },
  { name: '柳州', province: '广西', longitude: 109.4, latitude: 24.3 },

  // 海南省
  { name: '海口', province: '海南', longitude: 110.3, latitude: 20.0 },
  { name: '三亚', province: '海南', longitude: 109.5, latitude: 18.3 },

  // 四川省
  { name: '成都', province: '四川', longitude: 104.1, latitude: 30.7 },
  { name: '绵阳', province: '四川', longitude: 104.7, latitude: 31.5 },

  // 贵州省
  { name: '贵阳', province: '贵州', longitude: 106.7, latitude: 26.6 },
  { name: '遵义', province: '贵州', longitude: 106.9, latitude: 27.7 },

  // 云南省
  { name: '昆明', province: '云南', longitude: 102.7, latitude: 25.0 },
  { name: '大理', province: '云南', longitude: 100.2, latitude: 25.6 },
  { name: '丽江', province: '云南', longitude: 100.2, latitude: 26.9 },

  // 西藏自治区
  { name: '拉萨', province: '西藏', longitude: 91.1, latitude: 29.6 },

  // 陕西省
  { name: '西安', province: '陕西', longitude: 108.9, latitude: 34.3 },
  { name: '咸阳', province: '陕西', longitude: 108.7, latitude: 34.3 },

  // 甘肃省
  { name: '兰州', province: '甘肃', longitude: 103.8, latitude: 36.1 },
  { name: '天水', province: '甘肃', longitude: 105.7, latitude: 34.6 },

  // 青海省
  { name: '西宁', province: '青海', longitude: 101.7, latitude: 36.6 },

  // 宁夏回族自治区
  { name: '银川', province: '宁夏', longitude: 106.2, latitude: 38.5 },

  // 新疆维吾尔自治区
  { name: '乌鲁木齐', province: '新疆', longitude: 87.6, latitude: 43.8 },
  { name: '喀什', province: '新疆', longitude: 76.0, latitude: 39.5 },

  // 台湾省
  { name: '台北', province: '台湾', longitude: 121.5, latitude: 25.0 },
  { name: '高雄', province: '台湾', longitude: 120.3, latitude: 22.6 },

  // 香港特别行政区
  { name: '香港', province: '香港', longitude: 114.2, latitude: 22.3 },

  // 澳门特别行政区
  { name: '澳门', province: '澳门', longitude: 113.5, latitude: 22.2 },

  // 海外主要城市（华人聚集区）
  { name: '新加坡', province: '海外', longitude: 103.8, latitude: 1.3 },
  { name: '吉隆坡', province: '海外', longitude: 101.7, latitude: 3.1 },
  { name: '曼谷', province: '海外', longitude: 100.5, latitude: 13.8 },
  { name: '东京', province: '海外', longitude: 139.7, latitude: 35.7 },
  { name: '首尔', province: '海外', longitude: 127.0, latitude: 37.6 },
  { name: '洛杉矶', province: '海外', longitude: -118.2, latitude: 34.0 },
  { name: '旧金山', province: '海外', longitude: -122.4, latitude: 37.8 },
  { name: '纽约', province: '海外', longitude: -74.0, latitude: 40.7 },
  { name: '温哥华', province: '海外', longitude: -123.1, latitude: 49.3 },
  { name: '多伦多', province: '海外', longitude: -79.4, latitude: 43.7 },
  { name: '悉尼', province: '海外', longitude: 151.2, latitude: -33.9 },
  { name: '墨尔本', province: '海外', longitude: 144.9, latitude: -37.8 }
];

/**
 * 按省份分组城市
 */
export function getCitiesByProvince(): Record<string, City[]> {
  const grouped: Record<string, City[]> = {};
  for (const city of CITIES) {
    if (!grouped[city.province]) {
      grouped[city.province] = [];
    }
    grouped[city.province].push(city);
  }
  return grouped;
}

/**
 * 根据城市名查找城市
 * @param cityName 城市名称
 * @returns 城市信息，未找到返回 null
 */
export function findCityByName(cityName: string): City | null {
  return CITIES.find(c => c.name === cityName) || null;
}

/**
 * 搜索城市（支持模糊匹配）
 * @param query 搜索关键词
 * @returns 匹配的城市列表
 */
export function searchCities(query: string): City[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return CITIES.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.province.toLowerCase().includes(q)
  ).slice(0, 10);
}
