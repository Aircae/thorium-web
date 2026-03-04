"use client";

import { useEffect, useState } from "react";
import { PublicationGrid } from "@/components/Misc/PublicationGrid";
import Image from "next/image";

import { isManifestRouteEnabled } from "./ManifestRouteEnabled";

import "./reset.css";
import "./home.css";

const books = [
  {
    title: "掉入异世界也要努力活下去",
    author: "梦丣",
    cover: "/images/掉入异世界也要努力活下去.jpg",
    url: "/read/掉入异世界也要努力活下去",
    rendition: "EPUB"
  }
];

const onlineBooks = [
  {
    title: "Accessible EPUB3",
    author: "Matt Garrish",
    cover: "/images/accessibleEpub3.jpg",
    url: "/read/manifest/https%3A%2F%2Fpublication-server.readium.org%2Fwebpub%2FaHR0cHM6Ly9naXRodWIuY29tL0lEUEYvZXB1YjMtc2FtcGxlcy9yZWxlYXNlcy9kb3dubG9hZC8yMDIzMDcwNC9hY2Nlc3NpYmxlX2VwdWJfMy5lcHVi%2Fmanifest.json",
    rendition: "Reflowable EPUB"
  }
];

const webPublications = [
  {
    title: "Readium CSS Implementers’ Documentation",
    author: "Jiminy Panoz",
    cover: "/images/readium-css.jpg",
    url: "/read/experimental/readium-css",
    rendition: "Web Publication"
  }
];

export default function Home() {
  const [isManifestEnabled, setIsManifestEnabled] = useState<boolean>(true);

  useEffect(() => {
    const checkManifestRoute = async () => {
      try {
        const enabled = await isManifestRouteEnabled();
        setIsManifestEnabled(enabled);
      } catch (error) {
        console.error("Error checking manifest route:", error);
        setIsManifestEnabled(false);
      }
    };

    checkManifestRoute();
  }, []);

  return (
    <main id="home">
      <header className="header">
        <h1>Welcome to Thorium Web</h1>

        <p className="subtitle">An open-source ebook/audiobook/comics Web Reader</p>
      </header>

      <PublicationGrid
        publications={ [...books, ...webPublications] }
        renderCover={ (publication) => (
          <Image
            src={ publication.cover }
            alt=""
            loading="lazy"
            width={ 120 }
            height={ 180 }
          />
        ) }
      />

      { isManifestEnabled && (
        <>
        <div className="dev-books">
          <p>In dev you can also use the <code>/manifest/</code> route to load any publication. For instance:</p>
          
          <PublicationGrid
            publications={ onlineBooks }
            renderCover={ (publication) => (
              <Image
                src={ publication.cover }
                alt=""
                loading="lazy"
                width={ 120 }
                height={ 180 }
              />
            ) }
          />
        </div>
        </>
      ) }
    </main>
  );
}
