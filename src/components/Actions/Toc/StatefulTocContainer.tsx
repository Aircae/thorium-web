"use client";

import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  useDeferredValue
} from "react";
import { Link } from "@readium/shared";
import { ThActionsKeys, ThDockingKeys, ThSheetTypes, ThLayoutDirection } from "@/preferences/models";
import { StatefulActionContainerProps } from "../models/actions";
import { TocItem } from "@/core/Hooks/useTimeline";
import tocStyles from "./assets/styles/thorium-web.toc.module.css";
import Chevron from "./assets/icons/chevron_right.svg";
import { StatefulSheetWrapper } from "../../Sheets/StatefulSheetWrapper";
import { ThFormSearchField } from "@/core/Components";
import { Button, Collection, Key, Selection, useFilter } from "react-aria-components";
import { Tree, TreeItem, TreeItemContent } from "react-aria-components";
import { useNavigator } from "@/core/Navigator";
import { useDocking } from "../../Docking/hooks/useDocking";
import { useI18n } from "@/i18n/useI18n";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";
import { setTocEntry } from "@/lib/publicationReducer";
import { setImmersive, setUserNavigated } from "@/lib/readerReducer";
import { isActiveElement } from "@/core/Helpers/focusUtilities";
import { batch } from "react-redux";

export const StatefulTocContainer = ({ triggerRef }: StatefulActionContainerProps) => {
  const { t } = useI18n();

  const treeRef = useRef<HTMLDivElement>(null);
  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(new Set());

  const deferredExpandedKeys = useDeferredValue(expandedKeys);

  const unstableTimeline = useAppSelector(state => state.publication.unstableTimeline);
  const tocEntry = unstableTimeline?.toc?.currentEntry;
  const tocTree = unstableTimeline?.toc?.tree;

  const direction = useAppSelector(state => state.reader.direction);
  const isRTL = direction === ThLayoutDirection.rtl;

  const actionState = useAppSelector(state => state.actions.keys[ThActionsKeys.toc]);
  const dispatch = useAppDispatch();

  const { goLink } = useNavigator();

  const docking = useDocking(ThActionsKeys.toc);
  const sheetType = docking.sheetType;

  const { contains } = useFilter({ sensitivity: "base" });
  const [filterValue, setFilterValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cachedFilteredTreeRef = useRef<{ tree: TocItem[] | null; filterValue: string }>({
    tree: null,
    filterValue: ""
  });

  const getFilteredTree = (tree: TocItem[], filter: string): TocItem[] => {
    if (!filter || !tree || tree.length === 0) return tree;

    const cache = cachedFilteredTreeRef.current;
    if (cache.tree && cache.filterValue === filter && cache.tree.length === tree.length) {
      return cache.tree;
    }

    const recursiveFilter = (items: TocItem[]): TocItem[] => {
      const result: TocItem[] = [];
      for (const item of items) {
        const titleMatches = item.title && contains(item.title, filter);
        if (titleMatches) {
          result.push({
            id: item.id,
            href: item.href,
            title: item.title,
            position: item.position,
            children: undefined
          });
        } else if (item.children) {
          const filteredChildren = recursiveFilter(item.children);
          if (filteredChildren.length > 0) {
            result.push({ id: item.id, href: item.href, children: filteredChildren });
          }
        }
      }
      return result;
    };

    const filtered = recursiveFilter(tree);
    cachedFilteredTreeRef.current = { tree: filtered, filterValue: filter };
    return filtered;
  };

  const displayedTocTree = (!filterValue || !tocTree) ? tocTree : getFilteredTree(tocTree, filterValue);

  const selectedKeys = useMemo(() => (tocEntry ? [tocEntry] : []), [tocEntry]);

  const setOpen = useCallback((value: boolean) => {
    if (!value) {
      setFilterValue("");
      cachedFilteredTreeRef.current = { tree: null, filterValue: "" };
    }
    dispatch(setActionOpen({ key: ThActionsKeys.toc, isOpen: value }));
  }, [dispatch]);

  const actionStateRef = useRef(actionState);
  const sheetTypeRef = useRef(sheetType);
  useEffect(() => {
    actionStateRef.current = actionState;
    sheetTypeRef.current = sheetType;
  }, [actionState, sheetType]);

  const parentMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!tocTree) return map;
    const traverse = (items: TocItem[], parentId?: string) => {
      for (const item of items) {
        if (parentId) map.set(item.id, parentId);
        if (item.children) traverse(item.children, item.id);
      }
    };
    traverse(tocTree);
    return map;
  }, [tocTree]);

  const lastTocEntryRef = useRef<string | null>(null);
  const lastTocTreeRef = useRef<TocItem[] | null>(null);

  useEffect(() => {
    if (!tocEntry || !tocTree) return;

    if (tocEntry === lastTocEntryRef.current) return;
    if (tocTree === lastTocTreeRef.current && expandedKeys.has(tocEntry)) {
      lastTocEntryRef.current = tocEntry;
      return;
    }

    lastTocEntryRef.current = tocEntry;
    lastTocTreeRef.current = tocTree;

    const path: string[] = [];
    let currentId: string | undefined = tocEntry;
    while (currentId && parentMap.has(currentId)) {
      const parentId: string = parentMap.get(currentId)!;
      path.unshift(parentId);
      currentId = parentId;
    }

    if (path.length > 0) {
      setExpandedKeys(prev => {
        const newExpanded = new Set(prev);
        let hasUpdates = false;
        for (const parentId of path) {
          if (!newExpanded.has(parentId)) {
            newExpanded.add(parentId);
            hasUpdates = true;
          }
        }
        return hasUpdates ? newExpanded : prev;
      });
    }
  }, [tocEntry, tocTree, parentMap]);

  useEffect(() => {
    if (!actionState?.isOpen) {
      cachedFilteredTreeRef.current = { tree: null, filterValue: "" };
    }
  }, [actionState?.isOpen]);

  useEffect(() => {
    if (actionState?.isOpen && (!actionState?.docking || actionState?.docking === ThDockingKeys.transient)) {
      const handleEscape = (event: KeyboardEvent) => {
        if (!isActiveElement(searchInputRef.current) && !filterValue && event.key === "Escape") {
          setOpen(false);
        }
      };
      document.addEventListener("keydown", handleEscape, true);
      return () => document.removeEventListener("keydown", handleEscape, true);
    }
  }, [actionState, setOpen, filterValue]);

  const handleAction = useCallback((keys: Selection) => {
    if (keys === "all" || !keys || keys.size === 0) return;
    const key = [...keys][0];

    const el = document.querySelector(`[data-key="${key}"]`);
    const href = el?.getAttribute("data-href");
    if (!href) return;

    const link: Link = new Link({ href });
    const isDocked = actionStateRef.current?.isOpen &&
      (sheetTypeRef.current === ThSheetTypes.dockedStart || sheetTypeRef.current === ThSheetTypes.dockedEnd);

    const cb = () => {
      batch(() => {
        dispatch(setTocEntry(key));
        dispatch(setImmersive(true));
        dispatch(setUserNavigated(true));
      });
      if (!isDocked) setOpen(false);
    };

    goLink(link, true, cb);
  }, [dispatch, setOpen, goLink]);

  return (
    <StatefulSheetWrapper
      sheetType={sheetType}
      sheetProps={{
        id: ThActionsKeys.toc,
        triggerRef,
        heading: t("reader.tableOfContents.title"),
        className: tocStyles.wrapper,
        placement: "bottom",
        isOpen: actionState?.isOpen || false,
        onOpenChange: setOpen,
        onClosePress: () => setOpen(false),
        docker: docking.getDocker(),
        resetFocus: tocEntry,
        focusWithinRef: treeRef
      }}
    >
      {tocTree && tocTree.length > 0 ? (
        <>
          <ThFormSearchField
            aria-label={t("common.actions.search")}
            value={filterValue}
            onChange={setFilterValue}
            onClear={() => setFilterValue("")}
            className={tocStyles.search}
            compounds={{
              label: { className: tocStyles.searchLabel },
              input: {
                ref: searchInputRef,
                className: tocStyles.searchInput,
                placeholder: t("common.actions.search")
              },
              searchIcon: { className: tocStyles.searchIcon, hidden: !!filterValue },
              clearButton: {
                className: tocStyles.clearButton,
                isDisabled: !filterValue,
                "aria-label": t("common.actions.clear")
              }
            }}
          />

          <Tree
            ref={treeRef}
            aria-label={t("reader.toc.entries")}
            selectionMode="single"
            items={displayedTocTree}
            className={tocStyles.tree}
            onSelectionChange={handleAction}
            selectedKeys={selectedKeys}
            expandedKeys={deferredExpandedKeys}
            onExpandedChange={setExpandedKeys}
          >
            {function renderItem(item) {
              return (
                <TreeItem
                  data-href={item.href}
                  className={tocStyles.treeItem}
                  textValue={item.title || ""}
                  style={{ contentVisibility: 'auto', containIntrinsicSize: '2.5rem' }}
                >
                  <TreeItemContent>
                    {item.children && (
                      <Button
                        slot="chevron"
                        className={tocStyles.treeItemButton}
                        style={{ transform: isRTL ? "scaleX(-1)" : "none" } as CSSProperties}
                      >
                        <Chevron aria-hidden="true" focusable="false" />
                      </Button>
                    )}
                    <div className={tocStyles.treeItemText}>
                      <div className={tocStyles.treeItemTextTitle}>{item.title}</div>
                      {item.position && <div className={tocStyles.treeItemTextPosition}>{item.position}</div>}
                    </div>
                  </TreeItemContent>
                  <Collection items={item.children}>
                    {renderItem}
                  </Collection>
                </TreeItem>
              );
            }}
          </Tree>
        </>
      ) : (
        <div className={tocStyles.empty}>{t("reader.tableOfContents.emptyState.description")}</div>
      )}
    </StatefulSheetWrapper>
  );
};