import type { StructureResolver } from "sanity/structure";

const documentList = (S: Parameters<StructureResolver>[0], type: string, title: string) =>
  S.documentTypeList(type).title(title);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Akbar Nawasunda CMS")
    .items([
      S.listItem()
        .title("Site & Identity")
        .child(
          S.list()
            .title("Site & Identity")
            .items([
              documentList(S, "artistSite", "Artist Site"),
              documentList(S, "artistProfile", "Artist Biography"),
              documentList(S, "pressKit", "Press & Booking"),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("Music & Visuals")
        .child(
          S.list()
            .title("Music & Visuals")
            .items([
              documentList(S, "release", "Releases"),
              documentList(S, "visual", "Visual / Video"),
            ]),
        ),
      S.listItem()
        .title("Live & Events")
        .child(
          S.list()
            .title("Live & Events")
            .items([
              documentList(S, "liveSignal", "Live Signal"),
              documentList(S, "event", "Live Event / Tour Date"),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("All documents")
        .child(
          S.list()
            .title("All documents")
            .items(S.documentTypeListItems()),
        ),
    ]);
