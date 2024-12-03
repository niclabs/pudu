import { useEffect } from "react";
import { Tree, useSimpleTree } from "react-arborist";
import "./styles.css";


import "./App.css";

const initialData = [
  {
    id: "2",
    name: "Study Characteristics",
    children: [
      {
        id: "2-1",
        name: "Study Type",
        children: [
          { id: "2-1-1", name: "Randomized Controlled Trial (RCT)", children: [] },
          { id: "2-1-2", name: "Cohort Study", children: [] },
          { id: "2-1-3", name: "Case-Control Study", children: [] },
          { id: "2-1-4", name: "Systematic Review/Meta-Analysis", children: [] }
        ]
      },
      {
        id: "2-2",
        name: "Study Setting",
        children: [
          { id: "2-2-1", name: "Hospital-Based", children: [] },
          { id: "2-2-2", name: "Community-Based", children: [] },
          { id: "2-2-3", name: "Multicenter Study", children: [] }
        ]
      },
      {
        id: "2-3",
        name: "Sample Size",
        children: [
          { id: "2-3-1", name: "Small (<100 participants)", children: [] },
          { id: "2-3-2", name: "Medium (100–500 participants)", children: [] },
          { id: "2-3-3", name: "Large (>500 participants)", children: [] }
        ]
      }
    ]
  },
  {
    id: "3",
    name: "Population Tags",
    children: [
      {
        id: "3-1",
        name: "Demographics",
        children: [
          { id: "3-1-1", name: "Adults", children: [] },
          { id: "3-1-2", name: "Pediatrics", children: [] },
          { id: "3-1-3", name: "Elderly", children: [] }
        ]
      },
      {
        id: "3-2",
        name: "Condition/Disease",
        children: [
          { id: "3-2-1", name: "Diabetes Mellitus", children: [] },
          { id: "3-2-2", name: "Hypertension", children: [] },
          { id: "3-2-3", name: "Breast Cancer", children: [] },
          { id: "3-2-4", name: "Lung Cancer", children: [] }
        ]
      },
      {
        id: "3-3",
        name: "Comorbidities",
        children: [
          { id: "3-3-1", name: "Obesity", children: [] },
          { id: "3-3-2", name: "Cardiovascular Disease", children: [] },
          { id: "3-3-3", name: "Chronic Kidney Disease", children: [] }
        ]
      }
    ]
  },
  {
    id: "4",
    name: "Intervention Tags",
    children: [
      {
        id: "4-1",
        name: "Type of Intervention",
        children: [
          { id: "4-1-1", name: "Drug Therapy", children: [] },
          { id: "4-1-2", name: "Surgical Intervention", children: [] },
          { id: "4-1-3", name: "Lifestyle Changes (e.g., diet, exercise)", children: [] },
          { id: "4-1-4", name: "Psychological Therapy", children: [] }
        ]
      },
      {
        id: "4-2",
        name: "Drug/Agent Used",
        children: [
          { id: "4-2-1", name: "Metformin", children: [] },
          { id: "4-2-2", name: "Checkpoint Inhibitors (Immunotherapy)", children: [] },
          { id: "4-2-3", name: "Antibiotics (e.g., penicillin)", children: [] }
        ]
      }
    ]
  }
];


function App() {
  const [data, controller] = useSimpleTree(initialData);

  useEffect(() => {
    console.log(data);
  }, [data]);


  return (
    <div className="App">
        <p>Ejemplo de arbol para investigación </p>
        <Tree data={data}
        openByDefault={true}
        width={500}
        height={1000}
        indent={24}
        rowHeight={32}
         {...controller}></Tree>
    </div>
  );
}

export default App;
