import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";

type CollapsibleStickySectionHeaderProps = {
  children: ReactNode;
  maxHeight: number;
  minHeight: number;
  onChangeHeight?: (fraction: number, headerHeight: number) => void;
  top?: number;
  viewPort?: ReactElement;
};

export function CollapsibleStickySectionHeader({
  children,
  maxHeight,
  minHeight,
  onChangeHeight,
  top = 0,
  viewPort,
  ...props
}: CollapsibleStickySectionHeaderProps) {
  const probeRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  if (minHeight > maxHeight)
    throw Error("minHeight can not be greated than maxHeight.");
  const probeHeight = maxHeight - minHeight;
  useEffect(() => {
    const target = probeRef?.current;
    if (!target) return;
    const nCheckPoints = 100;
    const options = {
      root: viewPort || null,
      rootMargin: `${-(top + 1)}px 0px 0px 0px`,
      threshold: [...Array(nCheckPoints).keys(), nCheckPoints].map(
        (i) => i / nCheckPoints
      ),
    };
    const observerHandler = (entries: any[]) => {
      const header = ref.current;
      if (!header || !entries[0]) return;
      const { intersectionRatio, boundingClientRect } = entries[0];
      const headerHeight = minHeight + intersectionRatio * probeHeight;
      // @ts-ignore
      header.style.height = `${headerHeight}px`;
      onChangeHeight?.(intersectionRatio, headerHeight);
      // @ts-ignore
      header.style.position =
        boundingClientRect.top < top + 1 ? "sticky" : "unset";
    };
    // @ts-ignore
    const observer = new IntersectionObserver(observerHandler, options);
    target && observer.observe(target);
    return () => {
      target && observer.unobserve(target);
    };
  }, [probeRef?.current, viewPort]);

  const styles = useMemo(
    () => ({
      container: {
        position: "relative",
        height: `${maxHeight}px`,
        marginBottom: `${-maxHeight}px`,
      },
      probe: {
        position: "absolute",
        height: `${probeHeight}px`,
        top: `0px`,
        width: "100%",
      },
      header: {
        top: `${top}px`,
        height: `${maxHeight}px`,
        width: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
      },
    }),
    [maxHeight, minHeight, top]
  );

  return (
    <>
      <div className="container" style={styles.container as CSSProperties}>
        <div
          className="probe"
          ref={probeRef}
          style={styles.probe as CSSProperties}></div>
      </div>
      <header ref={ref} style={styles.header as CSSProperties} {...props}>
        {children}
      </header>
    </>
  );
}
