// LLM Integration for campaogn filter using OpenAI's API
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FundCard from "./FundCard";
import { loader } from "../assets";

const DisplayCampaigns = ({ title, isLoading, campaigns }) => {
  const [userInput, setUserInput] = useState([]);
  const [receivedAIResponse, setReceivedAIResponse] = useState([]);
  const [fetchedCampaigns, setFetchedCampaigns] = useState(false);
  const [campaignObj, setCampaignObj] = useState([]);
  const [loadedTitle, setLoadedTitle] = useState([]);
  const navigate = useNavigate();
  const api = "//Put your OpenAI-Api Key//";

  const handleNavigate = (campaign) => {
    navigate(`/campaign-details/${campaign.title}`, { state: campaign });
  };

  const campaign = [
    {
      id: "5f9f1b9b0b9b9c0017b0b1a0",
      title: "Need medical help ",
      description: "I am suffering from cancer and need money for treatment",
    },
    {
      id: "5f9f1b9b0b9b9c0017b0b1a1",
      title: "Test1",
      description: "I am suffering from cancer and need money for treatment",
    },
    {
      id: "5f9f1b9b0b9b9c0017b0b1a2",
      title: "HI",
      description: "I am suffering from cancer and need money for treatment",
    },
    {
      id: "5f9f1b9b0b9b9c0017b0b1a3",
      title: "HI",
      description: "I am suffering from cancer and need money for treatment",
    },
  ];

  const testarrreverse = ["HI", "HI", "Test1", "Need medical help "];
  const filteredArr = [];
  const testArr = ["Need medical help ", "Test1", "HI", "HI"];

  console.log(
    "campaigns",
    campaigns.map((campaign) => campaign.title)
  );
  function extractTextBetweenBrackets(str) {
    const startIndex = str.indexOf("[");
    const endIndex = str.indexOf("]");
    //remove the quotes

    const removeQuotes = (str) => str.replace(/['"]+/g, "");
    if (startIndex !== -1 && endIndex !== -1) {
      return removeQuotes(str.substring(startIndex + 1, endIndex)).split(",");
    }

    return "";
  }

  const array = [
    "need money for car",
    "need money for medical emergency",
    "Child is suffering from cancer",
  ];

  const arr = [
    "Child is suffering from cancer",
    "need money for medical emergency",
    "need money for car",
  ];

  //create a function that will arrange the array of string in the order string is present in the another array
  const arrangeArray = (arr) => {
    const filteredArr = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < array.length; j++) {
        if (arr[i] === array[j]) {
          filteredArr.push(arr[i]);
        }
      }
    }
    return filteredArr;
  };

  console.log("arrangeArray", arrangeArray(arr));

  useEffect(() => {
    setUserInput(JSON.stringify(campaigns.map((campaign) => campaign.title)));

    setTimeout(() => {
      if (userInput.length > 0) {
        setFetchedCampaigns(true);
      }
    }, 10000);
    clearTimeout();

    if (fetchedCampaigns) {
      setTimeout(() => {
        const fetchData = async () => {
          const response = await axios.post(
            "https://api.openai.com/v1/completions",
            {
              prompt: `you will receive an array of funding titles, you have to return an array  with first title as the most needed funding one based on the following rules:\n1. The medical emergency is to be ranked higher\n2. The crowd funding for poors or by ngos must be then considered\n3. on a tie rank the title which was first in the array\nonly return array dont send any other text message\n dont add quotes the titles \n the array is: ${userInput}`,
              model: "text-davinci-003",
              max_tokens: 50,
              n: 1,
              stop: ".",
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${api}`,
              },
            }
          );
          console.log(
            "recieved from openAI",
            extractTextBetweenBrackets(response.data.choices[0].text)
          );
          setReceivedAIResponse(
            extractTextBetweenBrackets(response.data.choices[0].text)
          );

          return response.data.choices[0].text;
        };
        fetchData();

        setFetchedCampaigns(false);
      }, 10000);
    }
    console.log("fetchedCampaigns", fetchedCampaigns);
    console.log("userInput", userInput);

    if (userInput.length > 0 && receivedAIResponse.length > 0) {
      receivedAIResponse.forEach((title) => {
        const campaignToRender = campaigns.find((campaign) =>
          campaign.title.includes(title)
        );
        if (
          campaignToRender &&
          campaignObj.map((obj) => obj.title) !== campaignToRender.title
        ) {
          // if titles are same donot push
          if (campaignObj.length > 0) {
            if (loadedTitle.includes(campaignToRender.title)) {
              return null;
            } else {
              setLoadedTitle((prev) => [...prev, campaignToRender.title]);
            }
          }
          setCampaignObj((prev) => [...prev, campaignToRender]);

          // remove duplicate objects from array
          const removeDuplicate = (arr) => {
            for (let i = 0; i < arr.length; i++) {
              if (arr[i] !== arr[i + 1]) {
                filteredArr.push(arr[i]);
              }
            }
            return filteredArr;
          };
          removeDuplicate(campaignObj);
          console.log("campaignToRender", campaignToRender);
          console.log(filteredArr);
        }
      });
    }

    console.log("campaignObj", campaignObj);

    return () => {
      console.log("cleanup");
    };
  }, [userInput, fetchedCampaigns]);

  console.log("array", extractTextBetweenBrackets(userInput));
  // remove all the titles from campaignObj which are similar to the previous one

  return (
    <div>
      <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">
        Filtered campaigns ({campaignObj.length})
      </h1>

      <div className="flex flex-wrap mt-[20px] gap-[26px]">
        {isLoading && (
          <img
            src={loader}
            alt="loader"
            className="w-[100px] h-[100px] object-contain"
          />
        )}

        {!isLoading && campaigns.length === 0 && (
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            You have not created any campigns yet
          </p>
        )}

        {campaignObj.length > 0 &&
          campaignObj.map((campaign) =>
            loadedTitle.includes(campaign.title) ? (
              <FundCard
                key={campaign.id}
                {...campaign}
                handleClick={() => handleNavigate(campaign)}
              />
            ) : null
          )}
      </div>
      <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">
        All campaigns ({campaigns.length})
      </h1>
      <div className="flex flex-wrap mt-[20px] gap-[26px]">
        {!isLoading &&
          campaigns.length > 0 &&
          campaigns.map((campaign) => (
            <FundCard
              key={campaign.id}
              {...campaign}
              handleClick={() => handleNavigate(campaign)}
            />
          ))}
      </div>
    </div>
  );
};

export default DisplayCampaigns;
