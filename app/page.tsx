"use client";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import Image from "next/image";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { Center } from "@/components/ui/center";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import React from "react";
import { config } from "@/config";

// Create Puck component config
// const config = {
//   components: {
//     Text: {
//       fields: {
//         children: {
//           type: "text",
//         },
//       },
//       defaultProps: {
//         children: "Text",
//       },
//       render: ({ children }) => {
//         return (
//           <Center className="w-[300px] h-[150px]">
//             <Progress value={40} size="md" orientation="horizontal">
//               <ProgressFilledTrack />
//             </Progress>
//           </Center>
//         );
//       },
//     },
//     Center: {
//       fields: {
//         className: { type: "text" },
//         content: { type: "slot" },
//       },
//       render: ({ content: Content, className }) => {
//         const CenterDropZone = React.forwardRef<any, any>(
//           function CenterDropZone(props, ref) {
//             const mergedClassName = [className, props?.className]
//               .filter(Boolean)
//               .join(" ");

//             return <Center {...props} ref={ref} className={mergedClassName} />;
//           },
//         );

//         return <Content as={CenterDropZone} />;
//       },
//     },
//   },
// };

// Describe the initial data
const initialData = {};

// Save the data to your database
const save = (data) => {};

export default function Home() {
  return <Puck config={config} data={initialData} onPublish={save} />;
}
