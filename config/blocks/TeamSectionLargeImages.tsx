import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";
import { DISALLOWED_NESTED_COMPONENTS } from "../fields/slotRules";

export type TeamSectionLargeImagesProps = {
  className: string;
  content: any;
};

type TeamMember = {
  name: string;
  role: string;
  imageUrl: string;
  xUrl: string;
  linkedinUrl: string;
};

const people: TeamMember[] = [
  {
    name: "Lindsay Walton",
    role: "Front-end Developer",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80",
    xUrl: "#",
    linkedinUrl: "#",
  },
  {
    name: "Courtney Henry",
    role: "Designer",
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80",
    xUrl: "#",
    linkedinUrl: "#",
  },
  {
    name: "Tom Cook",
    role: "Director of Product",
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80",
    xUrl: "#",
    linkedinUrl: "#",
  },
  {
    name: "Whitney Francis",
    role: "Copywriter",
    imageUrl:
      "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80",
    xUrl: "#",
    linkedinUrl: "#",
  },
  {
    name: "Leonard Krasner",
    role: "Senior Designer",
    imageUrl:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80",
    xUrl: "#",
    linkedinUrl: "#",
  },
  {
    name: "Floyd Miles",
    role: "Principal Designer",
    imageUrl:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80",
    xUrl: "#",
    linkedinUrl: "#",
  },
];

function buildMemberCard(member: TeamMember) {
  return {
    type: "GridItem",
    props: {
      className: "",
      columnsBase: "1",
      columnsSm: "",
      columnsMd: "",
      columnsLg: "",
      columnsClassName: "",
      content: [
        {
          type: "VStack",
          props: {
            className: "",
            space: "sm",
            content: [
              {
                type: "Image",
                props: {
                  source: member.imageUrl,
                  alt: member.name,
                  size: "full",
                  className:
                    "w-full h-auto aspect-[3/2] rounded-2xl object-cover outline outline-1 -outline-offset-1 outline-outline-200",
                },
              },
              {
                type: "Heading",
                props: {
                  title: member.name,
                  size: "lg",
                  className: "mt-6 text-typography-900 tracking-tight",
                  textAlignment: "text-left",
                  isTruncated: false,
                  bold: false,
                  underline: false,
                  strikeThrough: false,
                  sub: false,
                  italic: false,
                  highlight: false,
                },
              },
              {
                type: "Text",
                props: {
                  text: member.role,
                  size: "md",
                  className: "text-typography-600",
                  textAlignment: "text-left",
                  isTruncated: false,
                  bold: false,
                  underline: false,
                  strikeThrough: false,
                  sub: false,
                  italic: false,
                  highlight: false,
                },
              },
              {
                type: "HStack",
                props: {
                  className: "pt-1",
                  space: "md",
                  content: [
                    {
                      type: "Button",
                      props: {
                        variant: "link",
                        action: "secondary",
                        size: "sm",
                        className: "px-0 text-typography-500 hover:text-typography-700",
                        content: [
                          {
                            type: "ButtonText",
                            props: {
                              text: "X",
                              className: "text-typography-500 hover:text-typography-700",
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: "Button",
                      props: {
                        variant: "link",
                        action: "secondary",
                        size: "sm",
                        className: "px-0 text-typography-500 hover:text-typography-700",
                        content: [
                          {
                            type: "ButtonText",
                            props: {
                              text: "LinkedIn",
                              className: "text-typography-500 hover:text-typography-700",
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

const TeamSectionLargeImages: ComponentConfig<TeamSectionLargeImagesProps> = {
  inline: false,
  fields: {
    content: {
      type: "slot",
      disallow: DISALLOWED_NESTED_COMPONENTS,
      ai: { instructions: aiInstructions.slotContent },
    },
    className: {
      type: "textarea",
      label: "Classes",
      ai: { instructions: aiInstructions.className },
    },
  },
  defaultProps: {
    className: "py-24 sm:py-32",
    content: [
      {
        type: "Container",
        props: {
          maxWidth: "7xl",
          className: "px-6 lg:px-8",
          content: [
            {
              type: "Box",
              props: {
                className: "mx-auto max-w-2xl lg:mx-0",
                content: [
                  {
                    type: "Heading",
                    props: {
                      title: "Our team",
                      size: "5xl",
                      className: "text-typography-900 text-pretty tracking-tight",
                      textAlignment: "text-left",
                      isTruncated: false,
                      bold: false,
                      underline: false,
                      strikeThrough: false,
                      sub: false,
                      italic: false,
                      highlight: false,
                    },
                  },
                  {
                    type: "Text",
                    props: {
                      text: "We’re a dynamic group of individuals who are passionate about what we do and dedicated to delivering the best results for our clients.",
                      size: "lg",
                      className: "mt-6 text-typography-600",
                      textAlignment: "text-left",
                      isTruncated: false,
                      bold: false,
                      underline: false,
                      strikeThrough: false,
                      sub: false,
                      italic: false,
                      highlight: false,
                    },
                  },
                ],
              },
            },
            {
              type: "Grid",
              props: {
                className: "mx-auto mt-20 max-w-2xl lg:mx-0 lg:max-w-none",
                gap: "8",
                columnsMobile: "1",
                columnsTablet: "2",
                columnsDesktop: "3",
                columnsClassName: "",
                content: people.map(buildMemberCard),
              },
            },
          ],
        },
      },
    ],
  },
  render: ({
    className,
    content: Content,
    puck,
  }: WithPuckProps<TeamSectionLargeImagesProps>) => {
    const DropZone = React.forwardRef<any, any>(function DropZone(props, ref) {
      const mergedClassName = [className, props?.className]
        .filter(Boolean)
        .join(" ");
      return <GluestackBox {...props} ref={ref} className={mergedClassName} />;
    });

    return (
      <GluestackBox
        ref={
          puck.dragRef as unknown as React.Ref<
            React.ComponentRef<typeof GluestackBox>
          >
        }
      >
        <Content as={DropZone} minEmptyHeight={300} />
      </GluestackBox>
    );
  },
};

export default TeamSectionLargeImages;
