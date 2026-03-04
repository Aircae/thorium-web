"use client";

import React, { ComponentType, SVGProps } from "react";

import { Button, ButtonProps } from "react-aria-components";
import { WithRef } from "../customTypes";

import ArrowBack from "../assets/icons/arrow_back.svg";
import ArrowForward from "../assets/icons/arrow_forward.svg";

export interface ThPaginationLinkProps {
  icon?: ComponentType<SVGProps<SVGElement>> | null;
  node: React.ReactNode;
  onPress: () => void;
}

export interface ThPaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.RefObject<HTMLDivElement>;
  direction?: "left" | "right";
  children?: React.ReactNode;
  links?: {
    previous?: ThPaginationLinkProps;
    next?: ThPaginationLinkProps;
  };
  compounds?: {
    /**
     * Props for the list item element wrapping links and children
     */
    listItem?: React.HTMLAttributes<HTMLLIElement>;
    /**
     * Props for the previous button element
     */
    previousButton?: Exclude<WithRef<ButtonProps, HTMLButtonElement>, "type">;
    /**
     * Props for the next button element
     */
    nextButton?: Exclude<WithRef<ButtonProps, HTMLButtonElement>, "type">;
  };
}

export const ThPagination = ({
  ref,
  direction = "left",
  links,
  compounds,
  children,
  ...props
}: ThPaginationProps) => {
  if (!links) {
    return null;
  }

  const { previous, next } = links;

  return (
    <nav
      ref={ ref }
      { ...props }
    >
      { previous && (
        <li { ...compounds?.listItem }>
          <Button
            { ...compounds?.previousButton }
            type="button"
            onPress={ previous.onPress }
          >
            { previous.icon 
              ? <previous.icon aria-hidden="true" focusable="false" /> 
              : direction === "left"
                ? <ArrowBack aria-hidden="true" focusable="false" />
                : <ArrowForward aria-hidden="true" focusable="false" />
            }
            { previous.node }
          </Button>
        </li>
      )}

      { children && (
        <li { ...compounds?.listItem }>
          { children }
        </li>
      )}

      { next && (
        <li { ...compounds?.listItem }>
          <Button
            { ...compounds?.nextButton }
            type="button"
            onPress={ next.onPress }
          >
            { next.node }
            
            { next.icon 
              ? <next.icon aria-hidden="true" focusable="false" /> 
              : direction === "left"
                ? <ArrowForward aria-hidden="true" focusable="false" />
                : <ArrowBack aria-hidden="true" focusable="false" />
            }
          </Button>
        </li>
      )}
    </nav>
  );
};