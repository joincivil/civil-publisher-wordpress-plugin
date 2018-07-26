import * as React from "react";
import styled from "styled-components";
import { ApprovedRevision, EthAddress, Hex } from "@joincivil/core";
import { HollowGreenCheck, HollowRedNoGood, QuestionToolTip } from "@joincivil/components";
const { withSelect } = window.wp.data;
import { IconWrap } from "../styles";

export interface SignatureProps {
  authorUserId: number;
  sigData: ApprovedRevision;
  isDirty: boolean;
  isValid: boolean;
  userData: any;
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0;
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

function SignatureComponent(ownProps: SignatureProps): JSX.Element {
  const { sigData, userData, isDirty, isValid } = ownProps;

  let validIndicator;
  let showValidity = true;
  if (!sigData || isValid === null) {
    // still loading, or not yet signed
    showValidity = false;
  } else if (!isValid) {
    validIndicator = <HollowRedNoGood />;
  } else if (isDirty) {
    // Since we can't distinguish between dirty due to post content changes (which would invalidate sig) or dirty due to other changes (which wouldn't) this is the best we can do, unless we cache post content and repeatedly check against it, but that seems slow and messy.
    // TODO check if we can get revision JSON from autosave (ch1446) and check against that (though we'd still be in unknown state until autosave happened)
    validIndicator = <QuestionToolTip explainerText="Please save this post in order to check signature validity." />;
  } else {
    validIndicator = <HollowGreenCheck />;
  }

  const avatarUrl = userData.avatar_urls && userData.avatar_urls[48];

  return (
    <Wrapper>
      <UserWrap>
        <Avatar src={avatarUrl} />
        {userData.name}
      </UserWrap>
      {showValidity && <IconWrap>{validIndicator}</IconWrap>}
    </Wrapper>
  );
}

export const Signature = withSelect(
  (selectStore: any, ownProps: Partial<SignatureProps>): Partial<SignatureProps> => {
    const { isEditedPostDirty } = selectStore("core/editor");
    const { getUserData } = selectStore("civil/blockchain");

    return {
      ...ownProps,
      isDirty: isEditedPostDirty(),
      userData: getUserData(ownProps.authorUserId),
    };
  },
)(SignatureComponent);
