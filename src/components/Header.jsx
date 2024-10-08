"use client";

import Link from "next/link";
import { desktopApps } from "@/data";
import { useState, useEffect } from "react";
import OverlayWindow from "./OverlayWindow";
import Image from "next/image";

export default function Header({ tokenScore }) {
  const [openApps, setOpenApps] = useState([]);
  const [windowPositions, setWindowPositions] = useState({});
  const [selectedApp, setSelectedApp] = useState(null);

  const getRandomPosition = (index) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const windowWidth = 400;
    const windowHeight = 300;
    const spacing = 30;

    const xSteps = Math.floor((screenWidth - windowWidth) / spacing);
    const ySteps = Math.floor((screenHeight - windowHeight) / spacing);

    const x = (index % xSteps) * spacing;
    const y = Math.floor(index / xSteps) * spacing;

    return {
      x: Math.min(x, screenWidth - windowWidth),
      y: Math.min(y, screenHeight - windowHeight),
    };
  };

  const handleIconClick = (app) => {
    setSelectedApp((prev) => (prev === app ? null : app));
  };

  const handleAppClick = (app) => {
    if (!openApps.some((openApp) => openApp.name === app.name)) {
      const newPosition = getRandomPosition(openApps.length);
      setOpenApps((prevApps) => [...prevApps, app]);
      setWindowPositions((prevPositions) => ({
        ...prevPositions,
        [app.name]: newPosition,
      }));
    }
  };

  const handleClose = (app) => {
    setOpenApps((prevApps) =>
      prevApps.filter((openApp) => openApp.name !== app.name)
    );
    setWindowPositions((prevPositions) => {
      const { [app.name]: _, ...rest } = prevPositions;
      return rest;
    });
    if (selectedApp === app) {
      setSelectedApp(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".icon-container")) {
        setSelectedApp(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-screen w-full p-3 relative">
      <div className="flex flex-col gap-6">
        <Link href="/game">
          <div className="select-none w-32 ">
            <Image
              src={"/bazarmash.png"}
              width={300}
              height={300}
              className="size-20 mx-auto"
              alt="icon"
            />
            <h1 className="font-semibold text-center text-[12px]">BazARmash</h1>
          </div>
        </Link>
        <Link href="/nft-analysis">
          <div className="select-none w-32 ">
            <Image
              src={"/assets/nft-analysis.png"}
              width={300}
              height={300}
              className="size-20 mx-auto"
              alt="icon"
            />
            <h1 className="font-semibold text-center text-[12px]">Stock NFT</h1>
          </div>
        </Link>
        {desktopApps.map((app) => (
          <div
            role="button"
            tabIndex={0}
            aria-label={app.name}
            className={`icon-container rounded-sm px-1 py-2 cursor-pointer  h-24 w-36 ${
              openApps.some((openApp) => openApp.name === app.name)
                ? "bg-white/35"
                : ""
            } ${selectedApp === app ? "bg-white/35" : ""}`}
            key={app.name}
            onClick={() => handleIconClick(app)}
            onDoubleClick={() => handleAppClick(app)}
          >
            <div className="flex flex-col justify-center items-center select-none">
              <Image
                src={app.icon}
                height={300}
                width={300}
                className="size-12 mx-auto"
                alt="icon"
              />
              <h1 className="font-semibold text-[12px] mt-2">{app.name}</h1>
            </div>
          </div>
        ))}
        {openApps.map((app) => (
          <OverlayWindow
            key={app.name}
            app={app}
            onClose={handleClose}
            position={windowPositions[app.name]}
            index={1}
            tokenScore={tokenScore}
          >
            <div>{app.name}</div>
          </OverlayWindow>
        ))}
      </div>
    </div>
  );
}
