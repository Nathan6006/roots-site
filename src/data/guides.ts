// The guide index. Adding a guide means adding a page under src/pages/guides/
// and one entry here: the hub, the sitemap, and any cross-links all read from
// this list, so there is no second place to update and no way for the hub to
// fall out of step with what actually exists.
//
// `topic` is what the guide is trying to own in search. Keep them distinct.
// Two guides competing for the same phrase split their own signals.

export type Guide = {
  slug: string;
  title: string;
  blurb: string;
  topic: string;
  audience: string;
};

export const guides: Guide[] = [
  {
    slug: "reforesting-your-land-in-ohio",
    title: "How to reforest your land in Ohio",
    blurb:
      "The order the work happens in, from getting a forester on the site to what the first three years take.",
    topic: "reforestation on private land in Ohio",
    audience: "Landowners",
  },
];

export const guideUrl = (slug: string) => `/guides/${slug}/`;
