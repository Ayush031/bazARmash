"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Main } from "@/hooks/fetch";
import { processId } from "@/data";
import { useToast } from "@/hooks/use-toast";
import { ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import { ConnectButton } from "@/components/Buttons";
import { message, createDataItemSigner } from "@permaweb/aoconnect";
import { dryrun } from "@permaweb/aoconnect";
import {
  ScrollView,
  Window,
  WindowContent,
  WindowHeader,
  Toolbar,
  Button,
  Separator,
  ProgressBar,
  Frame,
} from "react95";
import {
  ArrowBigLeftDash,
  ArrowBigRightDash,
  ArrowLeft,
  ExternalLink,
  Shield,
} from "lucide-react";
import { BazarIcon } from "@/components/icons";

export default () => {
  const { toast } = useToast();
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTokenPair, setCurrentTokenPair] = useState([null, null]);
  const [percent, setPercent] = useState(0);
  const [TokenScore, setTokenScore] = useState({});

  const shuffleTokens = (tokenList) => {
    for (let i = tokenList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tokenList[i], tokenList[j]] = [tokenList[j], tokenList[i]];
    }
    return tokenList;
  };

  useEffect(() => {
    const fetchTokens = async () => {
      const tokenList = await Main();
      // console.log(tokenList);
      const shuffledTokens = shuffleTokens(tokenList);
      setTokens(shuffledTokens);
      if (shuffledTokens.length > 1) {
        setCurrentTokenPair([shuffledTokens[0], shuffledTokens[1]]);
      }

      const loadTime = shuffledTokens.length > 5 ? 2000 : 1000;
      setTimeout(() => {
        setIsLoading(false);
      }, loadTime);

      const progressInterval = setInterval(() => {
        setPercent((prevPercent) => {
          if (prevPercent >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prevPercent + 10;
        });
      }, 100);

      return () => clearInterval(progressInterval);
    };

    fetchTokens();
  }, []);
  
  useEffect(() => {
    const GetScore = async () => {
      try {
        const result = await dryrun({
          process: processId,
          tags: [{ name: "Action", value: "Get" }],
        });

        if (result.Messages[0].Data) {
          const Scores = JSON.parse(result.Messages[0].Data);
          setTokenScore(Scores);
        } else {
          console.error("No data found in result.Messages");
        }
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    };
    GetScore();
  }, [TokenScore]);

  const updateVote = async (selectedToken) => {
    if (isLoading) return;
    setIsLoading(true);

    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);

    try {
      await message({
        process: processId,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: "Action", value: "smash" }],
        data: selectedToken,
      });
      toast({
        title: "Smash Success",
        description: "You successfully smashed the NFT.",
      });

      const remainingTokens = tokens.filter(
        (token) =>
          token !== currentTokenPair[0] && token !== currentTokenPair[1]
      );
      const shuffledRemaining = shuffleTokens(remainingTokens);

      setTokens(shuffledRemaining);

      if (shuffledRemaining.length >= 2) {
        setCurrentTokenPair([shuffledRemaining[0], shuffledRemaining[1]]);
      } else {
        setCurrentTokenPair([null, null]);
      }

      setIsLoading(false);
    } catch (e) {
      console.error(e);
      toast({
        title: "Smash Error",
        description: "There was an error processing your smash.",
      });
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={original}>
      <Window className="h-screen w-screen">
        <Frame className="w-full p-1">
          <WindowHeader className="w-full flex justify-between ">
            <Link href="/">
              <span>{"🥝"}BazARmash</span>
            </Link>
            <Link href="/">
              <Button variant="primary">
                <ArrowLeft />
              </Button>
            </Link>
          </WindowHeader>
        </Frame>
        <Toolbar className="flex flex-wrap justify-between items-center my-1 mx-10">
          <Link href="https://bazar.arweave.dev" target="_blank">
            <Button variant="raised" className="flex items-center gap-3">
              <BazarIcon height={22} width={22} />
              <span>Bazar</span>
            </Button>
          </Link>
          <Link href="/" target="_blank">
            <Button variant="raised" className="flex items-center gap-3">
              <Shield height={22} width={22} />
              <span>Home</span>
            </Button>
          </Link>
          <ConnectButton />
        </Toolbar>
        <Separator />
        {isLoading ? (
          <div className="w-full text-center">
            <ProgressBar value={percent} width="100%" />
            <p className="text-black text-lg">Loading NFTs...</p>
          </div>
        ) : (
          <>
            <WindowContent className="flex justify-center">
              {currentTokenPair[0] && currentTokenPair[1] ? (
                <div className="flex items-center gap-8">
                  <Window>
                    <WindowHeader className="flex justify-between items-center">
                      <span>NFT Name</span>
                      <ExternalLink />
                    </WindowHeader>
                    <div
                      className="w-80 h-80 bg-center bg-cover cursor-pointer"
                      style={{
                        backgroundImage: `url(https://arweave.net/${currentTokenPair[0]})`,
                      }}
                      onClick={() => updateVote(currentTokenPair[0])}
                    />
                  </Window>
                  <ScrollView className="text-center">
                    <div className="flex justify-center items-center gap-4">
                      <Button onClick={() => updateVote(currentTokenPair[0])}>
                        <ArrowBigLeftDash />
                      </Button>
                      <span>Smash</span>
                      <Button onClick={() => updateVote(currentTokenPair[1])}>
                        <ArrowBigRightDash />
                      </Button>
                    </div>
                  </ScrollView>
                  <Window>
                    <WindowHeader className="flex justify-between items-center">
                      <span>NFT Name</span>
                      <ExternalLink />
                    </WindowHeader>
                    <ScrollView>
                      <div
                        className="w-80 h-80 bg-center bg-cover cursor-pointer"
                        style={{
                          backgroundImage: `url(https://arweave.net/${currentTokenPair[1]})`,
                        }}
                        onClick={() => updateVote(currentTokenPair[1])}
                      />
                    </ScrollView>
                  </Window>
                </div>
              ) : (
                <div className="text-white">No more NFTs to smash!</div>
              )}
            </WindowContent>
            <Separator />
          </>
        )}
      </Window>
    </ThemeProvider>
  );
};
