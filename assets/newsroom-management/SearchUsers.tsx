import * as React from "react";
const { apiRequest } = window.wp;
import { TextInput } from "@joincivil/components";
import { isWellFormattedAddress } from "@joincivil/utils";
import { debounce } from "lodash";
import styled from "styled-components";
import { userMetaKeys, apiNamespace } from "../constants";
import { connect, DispatchProp } from "react-redux";
import { addUser } from "@joincivil/newsroom-manager";
import { ManagerState } from "../shared/reducer";

export interface SearchUserProps {
  getOptions(str: string): Promise<any[]>;
  onSetAddress(address: string): void;
}

export interface SearchUsersStateValue {
  id?: number;
  name?: string;
  address?: string;
  email?: string;
}

export interface SearchUserState {
  value: SearchUsersStateValue;
  options: any[];
  selected: number;
  address: string;
  focused: boolean;
  error: string | JSX.Element;
  canAddAddress: boolean;
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const NameInputWrapper = styled.div`
  position: relative;
  width: 41%;
`;

const AddressInputWrapper = styled.div`
  position: relative;
  width: 55%;
`;

const OptionsContainer = styled.div`
  position: absolute;
  top: calc(100% - 20px);
  width: 100%;
  background-color: #fff;
  padding: 0;
  max-heigth: 180px;
  overflow-y: scroll;
  z-index: 9;
`;

const TypeAheadOption = styled.div`
  padding: 12px 9px;
  &.active {
    background: #008ec2;
    color: #fff;
  }
`;

const ErrorP = styled.p`
  color: #f2524a;
  margin-top: 0;
`;

const noAddressError =
  "No wallet address is associated with this account. You can add one here or have the user add their address to their profile.";
const noUserError =
  "No user matches this address. Make sure the address is correct and that all your newsroom members have added their addresses";

export class SearchUsersComponent extends React.Component<SearchUserProps & DispatchProp<any>, SearchUserState> {
  constructor(props: SearchUserProps & DispatchProp<any>) {
    super(props);
    this.setOptions = debounce(this.setOptions, 200);
    this.state = {
      value: {},
      options: [],
      selected: 0,
      address: "",
      focused: false,
      error: "",
      canAddAddress: false,
    };
  }

  public renderOptions(): JSX.Element | null {
    if (!this.showOptions()) {
      return null;
    }
    return (
      <OptionsContainer>
        {this.state.options.map((val, index) => {
          return (
            <TypeAheadOption
              onMouseDown={() => {
                if (val[userMetaKeys.WALLET_ADDRESS]) {
                  this.props.onSetAddress(val[userMetaKeys.WALLET_ADDRESS]);
                } else {
                  const errorNotice = (
                    <>
                      {noAddressError}{" "}
                      <a href={`${window.civilNamespace.wpAdminUrl}user-edit.php?user_id=${val.id}`} target="_blank">
                        Open User Profile
                      </a>
                    </>
                  );
                  this.setState({ error: errorNotice, canAddAddress: true });
                }
                this.setState({ value: val, address: val[userMetaKeys.WALLET_ADDRESS] });
              }}
              onMouseEnter={() => this.setState({ selected: index })}
              className={this.state.selected === index ? "active" : ""}
            >
              {val.name} | {val.email}
            </TypeAheadOption>
          );
        })}
      </OptionsContainer>
    );
  }

  public render(): JSX.Element {
    return (
      <Wrapper>
        <NameInputWrapper
          onKeyDown={this.onKeyDown}
          onFocus={() => this.setState({ focused: true })}
          onBlur={() => this.setState({ focused: false })}
        >
          <label>Name</label>
          <TextInput
            value={this.state.value.name}
            onChange={this.onChange}
            name={"username"}
            placeholder="Search for a user"
            noLabel
            autocomplete="off"
          />
          {this.renderOptions()}
        </NameInputWrapper>
        <AddressInputWrapper>
          <label>Wallet Address</label>
          <TextInput value={this.state.address} onChange={this.onAddressChange} name={"address"} />
          {this.state.error && <ErrorP>{this.state.error}</ErrorP>}
        </AddressInputWrapper>
      </Wrapper>
    );
  }

  private showOptions = (): boolean => {
    return this.state.options.length > 0 && !this.state.address.length && this.state.focused;
  };

  private onKeyDown = async (ev: { key: string }): Promise<void> => {
    if (this.showOptions()) {
      switch (ev.key) {
        case "ArrowDown":
          this.setState({ selected: Math.min(this.state.selected + 1, this.state.options.length - 1) });
          break;
        case "ArrowUp":
          this.setState({ selected: Math.max(this.state.selected - 1, 0) });
          break;
        case "Enter":
          const selection = this.state.options[this.state.selected];
          this.setState({ value: selection });
          await this.onAddressChange("", selection[userMetaKeys.WALLET_ADDRESS], selection);
          break;
      }
    }
  };

  private setOptions = async (str: string): Promise<void> => {
    try {
      const options = await this.props.getOptions(str);
      const selected = this.state.options.length !== options.length ? 0 : this.state.selected;
      this.setState({ options, selected });
    } catch (err) {
      const errText = "Failed to load options for user search";
      console.error(errText, err);
      throw Error(errText);
    }
  };

  private onChange = async (name: string, value: string): Promise<void> => {
    this.setState({
      error: value === "" ? "" : this.state.error,
      value: { name: value },
    });
    if (value.length > 1) {
      await this.setOptions(value);
    } else {
      this.setState({ options: [], selected: 0, canAddAddress: false });
    }
  };

  private onAddressChange = async (name: string, value: string, user?: SearchUsersStateValue): Promise<void> => {
    this.setState({
      error: value === "" ? "" : this.state.error,
      address: value,
    });
    const userValue = user || this.state.value;
    if (isWellFormattedAddress(value)) {
      this.props.onSetAddress(value);
      if (this.state.canAddAddress && userValue.id) {
        this.setState({ error: "" });
        await apiRequest({
          method: "POST",
          path: apiNamespace + `users/${userValue.id}`,
          data: {
            [userMetaKeys.WALLET_ADDRESS]: value,
          },
        });
        this.props.dispatch(addUser(value, userValue.name!));
      } else {
        try {
          const userFromWallet = await apiRequest({
            path: apiNamespace + `user-by-eth-address/${value}`,
          });
          this.setState({
            value: {
              name: userFromWallet.display_name,
              email: userFromWallet.email,
              address: value,
              id: userFromWallet.id,
            },
            error: "",
          });
        } catch {
          this.setState({
            error: noUserError,
            value: {
              name: "",
            },
          });
        }
      }
    }
  };
}

const mapStateToProps = (state: ManagerState, ownProps: SearchUserProps) => {
  return ownProps;
};

export const SearchUsers = connect(mapStateToProps)(SearchUsersComponent);
