export const PLACE_ICON_KEYS = Object.freeze([
  'accommodation',
  'amusement-park',
  'aquarium',
  'archaeological-site',
  'architecture',
  'art-culture',
  'beach',
  'brewery-winery',
  'bridge',
  'cafe',
  'cable-car',
  'camping',
  'castle',
  'cave',
  'church',
  'cinema',
  'coast',
  'cycling-route',
  'dam',
  'default',
  'entertainment',
  'experience',
  'farm',
  'ferry',
  'festival',
  'food',
  'food-production',
  'forest',
  'fortress',
  'games-arcade',
  'garden',
  'gorge',
  'hiking-route',
  'historic-streetscape',
  'industrial',
  'island',
  'lake',
  'lighthouse',
  'live-music',
  'market',
  'memorial',
  'modern-architecture',
  'monastery',
  'mountain',
  'mountain-hut',
  'museum',
  'natural-poi',
  'onsen',
  'palace',
  'park',
  'railway',
  'river',
  'rock-formation',
  'ruins',
  'science-technology',
  'shop',
  'shrine',
  'skiing',
  'spa',
  'sports',
  'temple',
  'theatre',
  'tower',
  'traditional-settlement',
  'viewpoint',
  'volcano',
  'water',
  'waterfall',
  'wetland',
  'wildlife',
  'zoo'
]);

const PLACE_ICON_SET = new Set(PLACE_ICON_KEYS);

function normalizePresentationText(value) {
  return String(value).normalize('NFKD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, ' ');
}

function presentationText(entity) {
  const values = entity?.custom?.values ?? {};
  return normalizePresentationText([
    entity?.entityType,
    entity?.names?.canonical,
    entity?.names?.local,
    ...(entity?.names?.aliases ?? []),
    entity?.custom?.namespace,
    ...(entity?.categories ?? []),
    ...(entity?.subcategories ?? []),
    ...(entity?.tags ?? []),
    values.primaryCategory,
    values.format,
    values.kind,
    values.poiType,
    values.activity,
    ...(Array.isArray(values.features) ? values.features : []),
    ...(Array.isArray(values.experienceKinds) ? values.experienceKinds : [])
  ].filter(Boolean).join(' '));
}

function mentions(text, ...terms) {
  return terms.some((term) => text.includes(normalizePresentationText(term)));
}

function naturalIcon(text) {
  if (mentions(text, 'waterfall', 'cascade', 'vodopad', '滝')) return 'waterfall';
  if (mentions(text, 'cave', 'cavern', 'grotto', 'jeskyne', '洞窟')) return 'cave';
  if (mentions(text, 'volcan', 'lava', 'caldera', 'sopka', '火山')) return 'volcano';
  if (mentions(text, 'wetland', 'marsh', 'bog', 'moor', 'mokrad', 'raseliniste', '湿原', '湿地')) return 'wetland';
  if (mentions(text, 'gorge', 'canyon', 'ravine', 'souteska', 'rokle', '峡谷')) return 'gorge';
  if (mentions(text, 'rock formation', 'rock pillar', 'rock city', 'sandstone', 'skalni', '岩峰', '奇岩')) return 'rock-formation';
  if (mentions(text, 'island', 'archipelago', 'ostrov', '島', '諸島')) return 'island';
  if (mentions(text, 'beach', 'strand', 'plaz', '砂浜', '浜')) return 'beach';
  if (mentions(text, 'coast', 'sea cliff', 'shore', 'pobrezi', '海岸', '岬')) return 'coast';
  if (mentions(text, 'lake', 'pond', 'lagoon', 'reservoir', 'jezero', 'rybnik', '湖', '池')) return 'lake';
  if (mentions(text, 'river', 'stream', 'canal', 'reka', 'potok', '川', '渓流')) return 'river';
  if (mentions(text, 'forest', 'woodland', 'cedar', 'grove', 'jungle', 'les', 'prales', '森', '林')) return 'forest';
  if (mentions(text, 'garden', 'botanical', 'arboretum', 'blossom', 'zahrada', '庭園')) return 'garden';
  if (mentions(text, 'public park', 'city park', 'nature park', 'parkland', 'mestsky park', '公園')) return 'park';
  if (mentions(text, 'wildlife', 'birdwatch', 'animal', 'deer', 'monkey', 'whale', '野生', '野鳥')) return 'wildlife';
  if (mentions(text, 'viewpoint', 'lookout', 'scenic overlook', 'vyhlidka', '展望', '見晴')) return 'viewpoint';
  if (mentions(text, 'mountain', 'peak', 'summit', 'alpine', 'highland', 'hora', 'vrchol', '高原', '山', '岳')) return 'mountain';
  return 'natural-poi';
}

function heritageIcon(text) {
  if (mentions(text, 'shinto', 'shrine', 'torii', 'jinja', '神社', '鳥居')) return 'shrine';
  if (mentions(text, 'buddhist', 'temple', 'pagoda', 'dera ', ' ji ', '寺', '仏閣', '塔')) return 'temple';
  if (mentions(text, 'monastery', 'abbey', 'convent', 'cloister', 'klaster', '修道院')) return 'monastery';
  if (mentions(text, 'church', 'cathedral', 'basilica', 'chapel', 'kostel', 'katedrala', '教会')) return 'church';
  if (mentions(text, 'ruin', 'zricenina', '廃墟', '城跡')) return 'ruins';
  if (mentions(text, 'fortress', 'citadel', 'fortification', 'pevnost', 'tvrz', '堡塁', '要塞')) return 'fortress';
  if (mentions(text, 'castle', 'hrad ', ' hrad', ' hrad ', '城')) return 'castle';
  if (mentions(text, 'palace', 'chateau', 'manor', 'zamek', 'palac', '御殿', '宮殿')) return 'palace';
  if (mentions(text, 'archaeolog', 'excavation', 'prehistoric', 'oppidum', 'archeolog', '遺跡', '古墳')) return 'archaeological-site';
  if (mentions(text, 'memorial', 'monument', 'pamatnik', 'pomnik', '記念碑', '慰霊')) return 'memorial';
  if (mentions(text, 'lighthouse', 'maják', 'majak', '灯台')) return 'lighthouse';
  if (mentions(text, 'observation tower', 'lookout tower', 'watchtower', 'rozhledna', '展望塔')) return 'tower';
  if (mentions(text, 'bridge', 'most ', ' most', '橋')) return 'bridge';
  if (mentions(text, 'dam', 'barrage', 'prehrada', 'ダム')) return 'dam';
  if (mentions(text, 'traditional settlement', 'traditional village', 'historic village', 'skanzen', '集落', '宿場')) return 'traditional-settlement';
  if (mentions(text, 'historic streetscape', 'built heritage', 'old town', 'historic street', 'historicke centrum', '町並')) return 'historic-streetscape';
  if (mentions(text, 'modern', 'unusual architecture', 'contemporary', 'brutalist', 'functionalism')) return 'modern-architecture';
  return 'architecture';
}

function entertainmentIcon(text) {
  if (mentions(text, 'amusement', 'theme park', 'ferris', 'roller coaster', 'lunapark', '遊園地')) return 'amusement-park';
  if (mentions(text, 'aquarium', 'oceanarium', 'akvarium', '水族館')) return 'aquarium';
  if (mentions(text, 'zoo', 'zoological', 'zoopark', '動物園')) return 'zoo';
  if (mentions(text, 'arcade', 'game center', 'game centre', 'herna', 'ゲームセンター')) return 'games-arcade';
  if (mentions(text, 'cinema', 'movie theatre', 'movie theater', 'kino', '映画館')) return 'cinema';
  if (mentions(text, 'theatre', 'theater', 'performing arts', 'divadlo', '劇場')) return 'theatre';
  if (mentions(text, 'live music', 'concert hall', 'music venue', 'hudebni klub', 'ライブハウス')) return 'live-music';
  if (mentions(text, 'stadium', 'arena', 'sports venue', 'sportovni', '競技場')) return 'sports';
  return 'entertainment';
}

function experienceIcon(text) {
  if (mentions(text, 'museum', 'collection', 'archive', 'muzeum', '資料館', '博物館')) return 'museum';
  if (mentions(text, 'railway', 'railroad', 'train', 'heritage rail', 'zeleznic', '鉄道', '駅')) return 'railway';
  if (mentions(text, 'ferry', 'passenger boat', 'boat trip', 'trajekt', '渡船', 'フェリー')) return 'ferry';
  if (mentions(text, 'cable car', 'funicular', 'gondola lift', 'lanovka', 'ケーブルカー', 'ロープウェイ')) return 'cable-car';
  if (mentions(text, 'spa', 'wellness', 'thermal bath', 'mineral bath', 'lazne', 'balneolog')) return 'spa';
  if (mentions(text, 'ski', 'snowboard', 'winter sport', 'lyz', 'スキー')) return 'skiing';
  if (mentions(text, 'cycling', 'cycle route', 'bike trail', 'cykl', 'サイクリング')) return 'cycling-route';
  if (mentions(text, 'science', 'technology', 'planetarium', 'observatory', 'veda', '科学', '技術')) return 'science-technology';
  if (mentions(text, 'industrial', 'engineering', 'infrastructure', 'factory', 'mine', 'dul ', '産業', '鉱山')) return 'industrial';
  if (mentions(text, 'brewery', 'winery', 'vineyard', 'distillery', 'sake', 'pivovar', 'vinars', '酒蔵', '醸造')) return 'brewery-winery';
  if (mentions(text, 'farm', 'agritourism', 'orchard', 'statek', 'farma', '農場')) return 'farm';
  if (mentions(text, 'art', 'cultural experience', 'gallery', 'galerie', '芸術')) return 'art-culture';
  if (mentions(text, 'festival', 'seasonal experience', 'matsuri', 'slavnost', '祭')) return 'festival';
  if (mentions(text, 'food', 'craft', 'production', 'workshop', 'vyroba', '工房')) return 'food-production';
  return 'experience';
}

export function presentationIconForEntity(entity) {
  const type = entity?.entityType;
  const text = presentationText(entity);

  if (type === 'accommodation') {
    if (mentions(text, 'onsen', 'hot spring', 'rotenburo', 'ryokan', '温泉', '露天風呂', '旅館')) return 'onsen';
    if (mentions(text, 'mountain hut', 'alpine hut', 'horská chata', 'horska chata', '山小屋')) return 'mountain-hut';
    if (mentions(text, 'camping', 'campground', 'campsite', 'kemp', 'キャンプ')) return 'camping';
    if (mentions(text, 'spa hotel', 'wellness hotel', 'lazensky')) return 'spa';
    return 'accommodation';
  }
  if (type === 'natural-poi') return naturalIcon(text);
  if (type === 'architecture') return heritageIcon(text);
  if (type === 'entertainment') return entertainmentIcon(text);
  if (type === 'experience') return experienceIcon(text);
  if (type === 'food') {
    if (mentions(text, 'cafe', 'coffee', 'teahouse', 'tea house', 'kavarna', 'kissaten', '喫茶', 'カフェ')) return 'cafe';
    if (mentions(text, 'brewery', 'winery', 'distillery', 'sake brewery', 'pivovar', 'vinars', '酒蔵')) return 'brewery-winery';
    return 'food';
  }
  if (type === 'shop') {
    return mentions(text, 'market', 'market hall', 'farmers market', 'trh', 'trznice', '市場', '朝市') ? 'market' : 'shop';
  }
  if (type === 'hiking-route') {
    if (mentions(text, 'cycling', 'cycle route', 'bike trail', 'cykl', 'サイクリング')) return 'cycling-route';
    if (mentions(text, 'ski touring', 'ski route', 'lyz', 'スキー')) return 'skiing';
    return 'hiking-route';
  }

  const direct = PLACE_ICON_SET.has(type) ? type : 'default';
  return direct;
}
