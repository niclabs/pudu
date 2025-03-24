import React from "react";
import { Table } from "antd";

const DemoTable = () => {
  const dataSource = [
    {
      key: "1",
      title: "Baby Yoda Found Dead in Miami: An In-Depth Study",
      year: 2005,
      authors: "George Lucas",
      categorized: "Yes",
      tags: ["Star Wars", "Baby Yoda", "Miami", "Crime", "Murder Investigations"],
    },
    {
      key: "2",
      title: "Baby Yoda 2: A Deep-Sea Mystery",
      year: 1995,
      authors: ["James Cameron", "Danny Devito", "Dr. Dolittle"],
      categorized: "Incomplete",
    },
    {
      key: "3",
      title: "UFOs Over Hoth: Baby Yoda’s Disappearance",
      year: 1987,
      authors: "John Alien",
      categorized: "No",
    },
    {
      key: "4",
      title: "Sith Lords and the Miami Connection: Baby Yoda’s Fate",
      year: 1999,
      authors: "Johnny Ravioli",
      categorized: "No",
    },
    {
      key: "5",
      title: "The Lost Baby Yoda Scrolls",
      year: 2010,
      authors: "Indiana Jones",
      categorized: "Incomplete",
    },
    {
      key: "6",
      title: "How Baby Yoda Took Over the Internet",
      year: 2021,
      authors: "El mismisimo Albert Einstein",
      categorized: "No",
    },
    {
      key: "7",
      title: "Baby Yoda and the Secret of the Sith",
      year: 2008,
      authors: ["Darth Vader", "Emperor Palpatine"],
      categorized: "Yes",
      tags: ["Star Wars", "Sith", "Jedi"],
    },
    {
      key: "8",
      title: "The Economics of Baby Yoda Merchandising",
      year: 2020,
      authors: "Disney Research Group",
      categorized: "Incomplete",
    },
    {
      key: "9",
      title: "Baby Yoda vs. Godzilla: A Scientific Perspective",
      year: 2015,
      authors: "Dr. Kaiju",
      categorized: "Yes",
      tags: ["Monsters", "Crossover", "Science"],
    },
    {
      key: "10",
      title: "The Mandalorian’s Guide to Babysitting Yoda",
      year: 2019,
      authors: ["Pedro Pascal"],
      categorized: "Yes",
      tags: ["Parenting", "Star Wars", "Mandalorian"],
    },
    {
      key: "11",
      title: "Baby Yoda’s Favorite Foods: A Culinary Analysis",
      year: 2022,
      authors: "Gordon Ramsay",
      categorized: "Yes",
      tags: ["Food", "Star Wars", "Cooking"],
    },
    {
      key: "12",
      title: "The Legal Rights of Force-Sensitive Children",
      year: 2016,
      authors: "Galactic Supreme Court",
      categorized: "Incomplete",
    },
    {
      key: "13",
      title: "Baby Yoda: Time Traveler or Just Cute?",
      year: 2023,
      authors: "Dr. Who",
      categorized: "No",
    },
    {
      key: "14",
      title: "Analyzing Baby Yoda Memes: A Cultural Study",
      year: 2021,
      authors: ["Meme Scholars Association"],
      categorized: "Yes",
      tags: ["Memes", "Pop Culture", "Internet"],
    },
  ];


  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Year",
      dataIndex: "year",
      defaultSortOrder: 'ascend',
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: "Authors",
      dataIndex: "authors",
      key: "authors",
      render: (authors) => (Array.isArray(authors) ? authors.join(", ") : authors),
    },
    {
      title: "Categorized",
      dataIndex: "categorized",
      key: "categorized",
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags) => (Array.isArray(tags) ? tags.join(", ") : tags),
    },
  ];

  return <Table 
    dataSource={dataSource} 
    columns={columns} 
    pagination={false}
    scroll={{ y: 500 }}
    style={{ width: "100%" }}
    
    />;
};

export default DemoTable;
