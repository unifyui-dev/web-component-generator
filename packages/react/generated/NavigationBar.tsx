import React from 'react';
import { Container } from '../components/Container';
import { Text } from '../components/Text';
import './NavigationBar.css';
interface NavigationBar {
  styleMap: {
    "--nav-item-1-color": string;
    "--nav-item-2-color": string;
    "--nav-item-3-color": string;
    "--nav-item-4-color": string;
    "--nav-logo-color": string;
  };
  data: {
    navCtaText: string;
    navItem1: string;
    navItem2: string;
    navItem3: string;
    navItem4: string;
    navLogoText: string;
  };
  children?: React.ReactNode;
}

export const NavigationBar = (props: NavigationBar) => (
  <Container style={{ "--nav-item-1-color": props.styleMap?.["--nav-item-1-color"], "--nav-item-2-color": props.styleMap?.["--nav-item-2-color"], "--nav-item-3-color": props.styleMap?.["--nav-item-3-color"], "--nav-item-4-color": props.styleMap?.["--nav-item-4-color"], "--nav-logo-color": props.styleMap?.["--nav-logo-color"] }} className="navigationbar-root"><Container className="navigationbar-root-container-0"><Text className="navigationbar-root-container-0-container-0" data={{ content: props.data?.navLogoText }}>{props.data?.navLogoText}</Text></Container><Container className="navigationbar-root-container-1"><Text className="navigationbar-root-container-1-container-0" data={{ content: "nav-item-1" }}>nav-item-1</Text><Text className="navigationbar-root-container-1-container-1" data={{ content: "nav-item-2" }}>nav-item-2</Text><Text className="navigationbar-root-container-1-container-2" data={{ content: "nav-item-3" }}>nav-item-3</Text><Text className="navigationbar-root-container-1-container-3" data={{ content: "nav-item-4" }}>nav-item-4</Text></Container><Container className="navigationbar-root-container-2"><Text className="navigationbar-root-container-2-container-0" data={{ content: props.data?.navCtaText }}>{props.data?.navCtaText}</Text></Container>{props.children}</Container>
);
