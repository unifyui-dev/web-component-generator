import React from 'react';
import { Container } from '../components/Container';
import { Text } from '../components/Text';
interface NavigationBar {
  navCtaText: string;
  navItem1: string;
  navItem1Color: string;
  navItem2: string;
  navItem2Color: string;
  navItem3: string;
  navItem3Color: string;
  navItem4: string;
  navItem4Color: string;
  navLogoColor: string;
  navLogoText: string;
}

export const NavigationBar = (props: NavigationBar) => (
  <Container styleMap={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ffffff", paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#e0e0e0", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}><Container styleMap={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}><Text styleMap={{ fontSize: 24, fontWeight: "700", color: props.navLogoColor }} data={{ content: props.navLogoText }}>{props.navLogoText}</Text></Container><Container styleMap={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 32 }}><Text styleMap={{ fontSize: 16, color: props.navItem1Color, cursor: "pointer", fontWeight: "500" }} data={{ content: props.navItem1 }}>{props.navItem1}</Text><Text styleMap={{ fontSize: 16, color: props.navItem2Color, cursor: "pointer" }} data={{ content: props.navItem2 }}>{props.navItem2}</Text><Text styleMap={{ fontSize: 16, color: props.navItem3Color, cursor: "pointer" }} data={{ content: props.navItem3 }}>{props.navItem3}</Text><Text styleMap={{ fontSize: 16, color: props.navItem4Color, cursor: "pointer" }} data={{ content: props.navItem4 }}>{props.navItem4}</Text></Container><Container styleMap={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "#0066cc", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, cursor: "pointer" }}><Text styleMap={{ color: "#ffffff", fontSize: 14, fontWeight: "600" }} data={{ content: props.navCtaText }}>{props.navCtaText}</Text></Container></Container>
);
