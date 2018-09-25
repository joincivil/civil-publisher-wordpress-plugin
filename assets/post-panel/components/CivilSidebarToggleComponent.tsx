import * as React from "react";
import * as ReactDom from "react-dom";
import { CivilNavBarButtons, CivilNavBarButtonsProps } from "./CivilNavBarButtons";
const { withDispatch, withSelect } = window.wp.data;
import { SelectType, DispatchType } from "../../../typings/gutenberg";
const { compose } = window.wp.compose;

export class CivilSidebarToggleComponent extends React.Component<CivilNavBarButtonsProps> {
  public divRef: HTMLDivElement | null;
  public el: HTMLDivElement;

  constructor(props: CivilNavBarButtonsProps) {
    super(props);
    this.divRef = null;
    this.el = document.createElement("div");
  }

  public componentDidMount(): void {
    if (this.divRef) {
      const buttonContainer = this.divRef.parentElement;
      buttonContainer!.style.height = "0px";
      buttonContainer!.style.width = "0px";
      buttonContainer!.style.padding = "0";
      buttonContainer!.parentNode!.insertBefore(this.el, buttonContainer!.nextSibling);
    }
  }

  public render(): JSX.Element {
    const portal = ReactDom.createPortal(<CivilNavBarButtons {...this.props} />, this.el);
    return (
      <>
        {portal}
        <div ref={el => (this.divRef = el)} />
      </>
    );
  }
}

export const CivilSidebarWithComposed = compose([
  withSelect(
    (selectStore: SelectType): Partial<CivilNavBarButtonsProps> => {
      const { isPluginSidebarOpened } = selectStore("core/edit-post");
      const {
        getTxHash,
        getLastPublishedRevision,
        getCurrentIsVersionPublished,
        getCurrentUserId,
        getSignatures,
        isValidSignature,
      } = selectStore("civil/blockchain");

      const userId = getCurrentUserId();
      const signatures = getSignatures();
      const ownSignature = signatures[userId];
      let isSignatureValid: boolean | undefined;
      if (ownSignature) {
        isSignatureValid = isValidSignature(ownSignature);
      }

      return {
        isOpen: isPluginSidebarOpened(),
        txHash: getTxHash(),
        lastpublishedRevision: getLastPublishedRevision(),
        currentIsVersionPublished: getCurrentIsVersionPublished(),
        isSignaturePresent: !!ownSignature,
        isSignatureValid,
      };
    },
  ),
  withDispatch(
    (dispatch: DispatchType): Partial<CivilNavBarButtonsProps> => {
      const { setOpenTab } = dispatch("civil/blockchain");
      const { openGeneralSidebar, closePublishSidebar } = dispatch("core/edit-post");

      const openCivilSidebar = () => {
        openGeneralSidebar("civil-sidebar/civil-sidebar");
        closePublishSidebar();
      };

      return {
        setOpenTab,
        openCivilSidebar,
      };
    },
  ),
])(CivilSidebarToggleComponent);
