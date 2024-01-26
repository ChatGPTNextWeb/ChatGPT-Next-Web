import { decode } from "html-entities";
import { convert as htmlToText } from "html-to-text";
import { Tool } from "@langchain/core/tools";

const SEARCH_REGEX =
  /DDG\.pageLayout\.load\('d',(\[.+\])\);DDG\.duckbar\.load\('images'/;
const IMAGES_REGEX =
  /;DDG\.duckbar\.load\('images', ({"ads":.+"vqd":{".+":"\d-\d+-\d+"}})\);DDG\.duckbar\.load\('news/;
const NEWS_REGEX =
  /;DDG\.duckbar\.load\('news', ({"ads":.+"vqd":{".+":"\d-\d+-\d+"}})\);DDG\.duckbar\.load\('videos/;
const VIDEOS_REGEX =
  /;DDG\.duckbar\.load\('videos', ({"ads":.+"vqd":{".+":"\d-\d+-\d+"}})\);DDG\.duckbar\.loadModule\('related_searches/;
const RELATED_SEARCHES_REGEX =
  /DDG\.duckbar\.loadModule\('related_searches', ({"ads":.+"vqd":{".+":"\d-\d+-\d+"}})\);DDG\.duckbar\.load\('products/;
const VQD_REGEX = /vqd=['"](\d+-\d+(?:-\d+)?)['"]/;

interface CallbackSearchResult {
  /** Website description */
  a: string;
  /** Unknown */
  ae: null;
  /** ddg!bang information (ex. w Wikipedia en.wikipedia.org) */
  b?: string;
  /** URL */
  c: string;
  /** URL of some sort. */
  d: string;
  /** Class name associations. */
  da?: string;
  /** Unknown */
  h: number;
  /** Website hostname */
  i: string;
  /** Unknown */
  k: null;
  /** Unknown */
  m: number;
  /** Unknown */
  o: number;
  /** Unknown */
  p: number;
  /** Unknown */
  s: string;
  /** Website Title */
  t: string;
  /** Website URL */
  u: string;
}

interface CallbackNextSearch {
  /** URL to the next page of results */
  n: string;
}

interface CallbackDuckbarPayload<T> {
  ads: null | any[];
  query: string;
  queryEncoded: string;
  response_type: string;
  results: T[];
  vqd: {
    [query: string]: string;
  };
}

interface DuckbarImageResult {
  /** The height of the image in pixels. */
  height: number;
  /** The image URL. */
  image: string;
  /** The source of the image. */
  source: string;
  /** The thumbnail URL. */
  thumbnail: string;
  /** The title (or caption) of the image. */
  title: string;
  /** The website URL of where the image came from. */
  url: string;
  /** The width of the image in pixels. */
  width: number;
}

interface DuckbarVideoResult {
  /** URL of the video */
  content: string;
  /** Description of the video */
  description: string;
  /** Duration of the video */
  duration: string;
  /** Embed HTML for the video */
  embed_html: string;
  /** Embed URL for the video */
  embed_url: string;
  /** Thumbnail images of the video */
  images: {
    large: string;
    medium: string;
    motion: string;
    small: string;
  };
  /** Where this search result came from */
  provider: string;
  /** ISO timestamp of the upload */
  published: string;
  /** What site the video was on */
  publisher: string;
  /** Various statistics */
  statistics: {
    /** View count of the video */
    viewCount: number | null;
  };
  /** Title of the video */
  title: string;
  /** Name of the video uploader(?) */
  uploader: string;
}

interface DuckbarRelatedSearch {
  display_text: string;
  text: string;
  web_search_url: string;
}

interface DuckbarNewsResult {
  date: number;
  excerpt: string;
  image?: string;
  relative_time: string;
  syndicate: string;
  title: string;
  url: string;
  use_relevancy: number;
  is_old?: number;
  fetch_image?: number;
}

interface SearchResults {
  /** Whether there were no results found. */
  noResults: boolean;
  /** The VQD of the search query. */
  vqd: string;
  /** The web results of the search. */
  results: SearchResult[];
  /** The image results of the search. */
  images?: DuckbarImageResult[];
  /** The news article results of the search. */
  news?: NewsResult[];
  /** The video results of the search. */
  videos?: VideoResult[];
  /** The related searches of the query. */
  related?: RelatedResult[];
}

interface VideoResult {
  /** The URL of the video. */
  url: string;
  /** The title of the video. */
  title: string;
  /** The description of the video. */
  description: string;
  /** The image URL of the video. */
  image: string;
  /** The duration of the video. (i.e. "9:20") */
  duration: string;
  /** The ISO timestamp of when the video was published. */
  published: string;
  /** Where the video was publised on. (i.e. "YouTube") */
  publishedOn: string;
  /** The name of who uploaded the video. */
  publisher: string;
  /** The view count of the video. */
  viewCount?: number;
}

interface NewsResult {
  /** The timestamp of when the article was created. */
  date: number;
  /** An except of the article. */
  excerpt: string;
  /** The image URL used in the article. */
  image?: string;
  /** The relative time of when the article was posted, in human readable format. */
  relativeTime: string;
  /** Where this article was indexed from. */
  syndicate: string;
  /** The title of the article. */
  title: string;
  /** The URL of the article. */
  url: string;
  /** Whether this article is classified as old. */
  isOld: boolean;
}

interface SearchResult {
  /** The hostname of the website. (i.e. "google.com") */
  hostname: string;
  /** The URL of the result. */
  url: string;
  /** The title of the result. */
  title: string;
  /**
   * The sanitized description of the result.
   * Bold tags will still be present in this string.
   */
  description: string;
  /** The description of the result. */
  rawDescription: string;
  /** The icon of the website. */
  icon: string;
  /** The ddg!bang information of the website, if any. */
  bang?: SearchResultBang;
}

interface SearchResultBang {
  /** The prefix of the bang. (i.e. "w" for !w) */
  prefix: string;
  /** The title of the bang. */
  title: string;
  /** The domain of the bang. */
  domain: string;
}

interface RelatedResult {
  text: string;
  raw: string;
}

enum SearchTimeType {
  /** From any time. */
  ALL = "a",
  /** From the past day. */
  DAY = "d",
  /** From the past week. */
  WEEK = "w",
  /** From the past month. */
  MONTH = "m",
  /** From the past year. */
  YEAR = "y",
}

interface SearchOptions {
  /** The safe search type of the search. */
  safeSearch?: SafeSearchType;
  /** The time range of the searches, can be a SearchTimeType or a date range ("2021-03-16..2021-03-30") */
  time?: SearchTimeType | string;
  /** The locale(?) of the search. Defaults to "en-us". */
  locale?: string;
  /** The region of the search. Defaults to "wt-wt" or all regions. */
  region?: string;
  /** The market region(?) of the search. Defaults to "US". */
  marketRegion?: string;
  /** The number to offset the results to. */
  offset?: number;
  /**
   * The string that acts like a key to a search.
   * Set this if you made a search with the same query.
   */
  vqd?: string;
}

enum SafeSearchType {
  /** Strict filtering, no NSFW content. */
  STRICT = 0,
  /** Moderate filtering. */
  MODERATE = -1,
  /** No filtering. */
  OFF = -2,
}

const defaultOptions: SearchOptions = {
  safeSearch: SafeSearchType.OFF,
  time: SearchTimeType.ALL,
  locale: "en-us",
  region: "wt-wt",
  offset: 0,
  marketRegion: "us",
};

async function search(
  query: string,
  options?: SearchOptions,
): Promise<SearchResults> {
  if (!query) throw new Error("Query cannot be empty!");
  if (!options) options = defaultOptions;
  else options = sanityCheck(options);

  let vqd = options.vqd!;
  if (!vqd) vqd = await getVQD(query, "web");

  const queryObject: Record<string, string> = {
    q: query,
    ...(options.safeSearch !== SafeSearchType.STRICT ? { t: "D" } : {}),
    l: options.locale!,
    ...(options.safeSearch === SafeSearchType.STRICT ? { p: "1" } : {}),
    kl: options.region || "wt-wt",
    s: String(options.offset),
    dl: "en",
    ct: "US",
    ss_mkt: options.marketRegion!,
    df: options.time! as string,
    vqd,
    ...(options.safeSearch !== SafeSearchType.STRICT
      ? { ex: String(options.safeSearch) }
      : {}),
    sp: "1",
    bpa: "1",
    biaexp: "b",
    msvrtexp: "b",
    ...(options.safeSearch === SafeSearchType.STRICT
      ? {
          videxp: "a",
          nadse: "b",
          eclsexp: "a",
          stiaexp: "a",
          tjsexp: "b",
          related: "b",
          msnexp: "a",
        }
      : {
          nadse: "b",
          eclsexp: "b",
          tjsexp: "b",
          // cdrexp: 'b'
        }),
  };

  const response = await fetch(
    `https://links.duckduckgo.com/d.js?${queryString(queryObject)}`,
  );
  const data = await response.text();

  if (data.includes("DDG.deep.is506"))
    throw new Error("A server error occurred!");

  const searchResults = JSON.parse(
    SEARCH_REGEX.exec(data)![1].replace(/\t/g, "    "),
  ) as (CallbackSearchResult | CallbackNextSearch)[];

  if (searchResults.length === 1 && !("n" in searchResults[0])) {
    const onlyResult = searchResults[0] as CallbackSearchResult;
    /* istanbul ignore next */
    if (
      (!onlyResult.da && onlyResult.t === "EOF") ||
      !onlyResult.a ||
      onlyResult.d === "google.com search"
    )
      return {
        noResults: true,
        vqd,
        results: [],
      };
  }

  const results: SearchResults = {
    noResults: false,
    vqd,
    results: [],
  };

  for (const search of searchResults) {
    if ("n" in search) continue;
    let bang: SearchResultBang | undefined;
    if (search.b) {
      const [prefix, title, domain] = search.b.split("\t");
      bang = { prefix, title, domain };
    }
    results.results.push({
      title: search.t,
      description: decode(search.a),
      rawDescription: search.a,
      hostname: search.i,
      icon: `https://external-content.duckduckgo.com/ip3/${search.i}.ico`,
      url: search.u,
      bang,
    });
  }

  // Images
  const imagesMatch = IMAGES_REGEX.exec(data);
  if (imagesMatch) {
    const imagesResult = JSON.parse(
      imagesMatch[1].replace(/\t/g, "    "),
    ) as CallbackDuckbarPayload<DuckbarImageResult>;
    results.images = imagesResult.results.map((i) => {
      i.title = decode(i.title);
      return i;
    });
  }

  // News
  const newsMatch = NEWS_REGEX.exec(data);
  if (newsMatch) {
    const newsResult = JSON.parse(
      newsMatch[1].replace(/\t/g, "    "),
    ) as CallbackDuckbarPayload<DuckbarNewsResult>;
    results.news = newsResult.results.map((article) => ({
      date: article.date,
      excerpt: decode(article.excerpt),
      image: article.image,
      relativeTime: article.relative_time,
      syndicate: article.syndicate,
      title: decode(article.title),
      url: article.url,
      isOld: !!article.is_old,
    })) as NewsResult[];
  }

  // Videos
  const videosMatch = VIDEOS_REGEX.exec(data);
  if (videosMatch) {
    const videoResult = JSON.parse(
      videosMatch[1].replace(/\t/g, "    "),
    ) as CallbackDuckbarPayload<DuckbarVideoResult>;
    results.videos = [];
    /* istanbul ignore next */
    for (const video of videoResult.results) {
      results.videos.push({
        url: video.content,
        title: decode(video.title),
        description: decode(video.description),
        image:
          video.images.large ||
          video.images.medium ||
          video.images.small ||
          video.images.motion,
        duration: video.duration,
        publishedOn: video.publisher,
        published: video.published,
        publisher: video.uploader,
        viewCount: video.statistics.viewCount || undefined,
      });
    }
  }

  // Related Searches
  const relatedMatch = RELATED_SEARCHES_REGEX.exec(data);
  if (relatedMatch) {
    const relatedResult = JSON.parse(
      relatedMatch[1].replace(/\t/g, "    "),
    ) as CallbackDuckbarPayload<DuckbarRelatedSearch>;
    results.related = [];
    for (const related of relatedResult.results) {
      results.related.push({
        text: related.text,
        raw: related.display_text,
      });
    }
  }
  return results;
}

function queryString(query: Record<string, string>) {
  return new URLSearchParams(query).toString();
}

async function getVQD(query: string, ia = "web") {
  try {
    const response = await fetch(
      `https://duckduckgo.com/?${queryString({ q: query, ia })}`,
    );
    const data = await response.text();
    return VQD_REGEX.exec(data)![1];
  } catch (e) {
    throw new Error(`Failed to get the VQD for query "${query}".`);
  }
}

function sanityCheck(options: SearchOptions) {
  options = Object.assign({}, defaultOptions, options);

  if (!(options.safeSearch! in SafeSearchType))
    throw new TypeError(
      `${options.safeSearch} is an invalid safe search type!`,
    );

  /* istanbul ignore next */
  if (typeof options.safeSearch! === "string")
    options.safeSearch = SafeSearchType[
      options.safeSearch!
    ] as any as SafeSearchType;

  if (typeof options.offset !== "number")
    throw new TypeError(`Search offset is not a number!`);

  if (options.offset! < 0)
    throw new RangeError("Search offset cannot be below zero!");

  if (
    options.time &&
    !Object.values(SearchTimeType).includes(options.time as SearchTimeType) &&
    !/\d{4}-\d{2}-\d{2}..\d{4}-\d{2}-\d{2}/.test(options.time as string)
  )
    throw new TypeError(`${options.time} is an invalid search time!`);

  if (!options.locale || typeof options.locale! !== "string")
    throw new TypeError("Search locale must be a string!");

  if (!options.region || typeof options.region! !== "string")
    throw new TypeError("Search region must be a string!");

  if (!options.marketRegion || typeof options.marketRegion! !== "string")
    throw new TypeError("Search market region must be a string!");

  if (options.vqd && !/\d-\d+-\d+/.test(options.vqd))
    throw new Error(`${options.vqd} is an invalid VQD!`);

  return options;
}

export class DuckDuckGo extends Tool {
  name = "duckduckgo_search";
  maxResults = 4;

  /** @ignore */
  async _call(input: string) {
    const searchResults = await search(input, {
      safeSearch: SafeSearchType.OFF,
    });

    if (searchResults.noResults) {
      return "No good search result found";
    }

    const results = searchResults.results
      .slice(0, this.maxResults)
      .map(({ title, description, url }) => htmlToText(description))
      .join("\n\n");

    return results;
  }

  description =
    "a search engine. useful for when you need to answer questions about current events. input should be a search query.";
}
