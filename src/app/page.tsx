"use client";

import { useEffect, useState } from "react";
import { PublicationGrid } from "@/components/Misc/PublicationGrid";
import Image from "next/image";

import { isManifestRouteEnabled } from "./ManifestRouteEnabled";

import "./reset.css";
import "./home.css";

interface Publication {
  title: string;
  author: string;
  cover: string;
  url: string;
  rendition: string;
}

const books = [
  {
    title: "掉入异世界也要努力活下去",
    author: "梦丣",
    cover: "/images/book-1.jpg",
    url: "/read/book-1",
    rendition: "EPUB"
  }
];

const onlineBooks: Publication[] = [];
const webPublications: Publication[] = [];

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
        <h1>阅读</h1>
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
