import * as React from "react";
import styled from "styled-components";
import { ApprovedRevision } from "@joincivil/core";
import { HollowGreenCheck, HollowRedNoGood, QuestionToolTip, ToolTip, ClipLoader } from "@joincivil/components";
const { withSelect } = window.wp.data;
import { siteTimezoneFormat } from "../../util";
import { IconWrap, colors } from "../styles";

export interface SignatureProps {
  authorUserId: number;
  isDirty: boolean;
  isSavingPost: boolean;
  userData: any;
  sigData?: ApprovedRevision;
  isValid?: boolean;
}

const WrapperInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const WrapperOuter = styled.div`
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }

  ${/* This rule is very dumb but I can't find another way to add this style to `ToolTip`. Neither adding styles to `styled(ToolTip)` nor adding `style` attribute to `<ToolTip>` works. */ ""} & > div {
    width: 100%;
  }
`;

const UserWrap = styled.span`
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  width: 24px;
  margin-right: 8px;
  border-radius: 50%;
  border: 0.5px solid #d5d5d5;
`;

const Unsigned = styled.span`
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 100%;
  background: ${colors.GRAY};
`;

function SignatureComponent(ownProps: SignatureProps): JSX.Element {
  const { sigData, userData, isDirty, isValid, isSavingPost } = ownProps;
  let validIndicator;
  let tipText;
  if (!sigData) {
    tipText = "This user hasn't signed yet";
    validIndicator = <Unsigned />;
  } else if (isValid === null || isSavingPost) {
    tipText = "Validating signature...";
    validIndicator = <ClipLoader size={20} />;
  } else if (!isValid) {
    tipText = "This post has been updated since last signed and requires a new signature";
    validIndicator = <HollowRedNoGood />;
  } else if (isDirty) {
    // Since we can't distinguish between dirty due to post content changes (which would invalidate sig) or dirty due to other changes (which wouldn't) this is the best we can do, unless we cache post content and repeatedly check against it, but that seems slow and messy.
    // TODO check if we can get revision JSON from autosave (ch1446) and check against that (though we'd still be in unknown state until autosave happened)
    tipText = "Please save this post in order to check signature validity";
    validIndicator = <QuestionToolTip explainerText="" />;
  } else {
    tipText = `Signed ${siteTimezoneFormat(sigData.date)}`;
    validIndicator = <HollowGreenCheck />;
  }

  const avatarUrl = userData.avatar_urls && userData.avatar_urls[48];

  const signatureInner = (
    <WrapperInner>
      <UserWrap>
        <Avatar src={avatarUrl} />
        {/* TODO If co-authors-plus is installed, this won't match the display name set in any linked Guest Author profile. */}
        {userData.name}
      </UserWrap>
      <IconWrap>{validIndicator}</IconWrap>
    </WrapperInner>
  );

  return tipText ? (
    <WrapperOuter>
      <ToolTip explainerText={tipText}>{signatureInner}</ToolTip>
    </WrapperOuter>
  ) : (
    signatureInner
  );
}

export const Signature = withSelect(
  (selectStore: any, ownProps: Partial<SignatureProps>): Partial<SignatureProps> => {
    const { isEditedPostDirty, isSavingPost } = selectStore("core/editor");
    const { getUserData } = selectStore("civil/blockchain");

    return {
      ...ownProps,
      isDirty: isEditedPostDirty(),
      isSavingPost: isSavingPost(),
      userData: getUserData(ownProps.authorUserId),
    };
  },
)(SignatureComponent);
