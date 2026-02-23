import React from "react";
import type { ComponentConfig, WithPuckProps } from "@puckeditor/core";
import { Box as GluestackBox } from "../../components/ui/box";
import { aiInstructions } from "../fields/aiInstructions";
import { DISALLOWED_NESTED_COMPONENTS } from "../fields/slotRules";

export type TeamSectionSmallImagesProps = {
  className: string;
  content: any;
};

type TeamMember = {
  name: string;
  role: string;
  imageUrl: string;
};

const people: TeamMember[] = [
  {
    name: "Leslie Alexander",
    role: "Co-Founder / CEO",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Michael Foster",
    role: "Co-Founder / CTO",
    imageUrl:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Dries Vincent",
    role: "Business Relations",
    imageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Lindsay Walton",
    role: "Front-end Developer",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Courtney Henry",
    role: "Designer",
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Tom Cook",
    role: "Director of Product",
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
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
          type: "HStack",
          props: {
            className: "items-center",
            space: "lg",
            content: [
              {
                type: "Image",
                props: {
                  source: member.imageUrl,
                  alt: member.name,
                  size: "md",
                  borderRadiusClass: "rounded-full",
                  objectFitClass: "object-cover",
                  className:
                    "h-16 w-16 outline outline-1 -outline-offset-1 outline-outline-200",
                },
              },
              {
                type: "VStack",
                props: {
                  className: "",
                  space: "xs",
                  content: [
                    {
                      type: "Heading",
                      props: {
                        title: member.name,
                        size: "md",
                        className: "text-typography-900 tracking-tight",
                        textAlignment: "text-left",
                        isTruncated: false,
                        bold: true,
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
                        size: "sm",
                        className: "text-primary-600",
                        textAlignment: "text-left",
                        isTruncated: false,
                        bold: true,
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
            ],
          },
        },
      ],
    },
  };
}

const TeamSectionSmallImages: ComponentConfig<TeamSectionSmallImagesProps> = {
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
              type: "Grid",
              props: {
                className: "gap-20 items-start xl:grid-cols-3",
                gap: "10",
                columnsMobile: "1",
                columnsTablet: "1",
                columnsDesktop: "3",
                columnsClassName: "",
                content: [
                  {
                    type: "GridItem",
                    props: {
                      className: "",
                      columnsBase: "1",
                      columnsSm: "",
                      columnsMd: "",
                      columnsLg: "1",
                      columnsClassName: "",
                      content: [
                        {
                          type: "VStack",
                          props: {
                            className: "max-w-xl",
                            space: "md",
                            content: [
                              {
                                type: "Heading",
                                props: {
                                  title: "Meet our leadership",
                                  size: "4xl",
                                  className: "text-typography-900 text-pretty tracking-tight",
                                  textAlignment: "text-left",
                                  isTruncated: false,
                                  bold: true,
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
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    type: "GridItem",
                    props: {
                      className: "",
                      columnsBase: "1",
                      columnsSm: "",
                      columnsMd: "",
                      columnsLg: "2",
                      columnsClassName: "xl:col-span-2",
                      content: [
                        {
                          type: "Grid",
                          props: {
                            className: "gap-x-8 gap-y-12 sm:gap-y-16",
                            gap: "4",
                            columnsMobile: "1",
                            columnsTablet: "2",
                            columnsDesktop: "2",
                            columnsClassName: "",
                            content: people.map(buildMemberCard),
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
  render: ({
    className,
    content: Content,
    puck,
  }: WithPuckProps<TeamSectionSmallImagesProps>) => {
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

export default TeamSectionSmallImages;
