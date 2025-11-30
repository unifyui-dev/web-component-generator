import React from 'react';
import { Container } from '../components/Container';
import { Image } from '../components/Image';
import { Text } from '../components/Text';
interface HeroSection {
  heroCtaBgColor: string;
  heroCtaText: string;
  heroHeading: string;
  heroImageSrc: string;
  heroSubheading: string;
  children?: React.ReactNode;
}

export const HeroSection = (props: HeroSection) => (
  <Container styleMap={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", width: "100%", minHeight: 500 }}><Image styleMap={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }} data={{ src: props.heroImageSrc }}></Image><Container styleMap={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 1, padding: 40, gap: 24 }}><Text styleMap={{ color: "#ffffff", fontSize: 48, fontWeight: "700", textAlign: "center" }} data={{ content: props.heroHeading }}>{props.heroHeading}</Text><Text styleMap={{ color: "#ffffff", fontSize: 20, textAlign: "center", maxWidth: 600 }} data={{ content: props.heroSubheading }}>{props.heroSubheading}</Text><Container styleMap={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: props.heroCtaBgColor, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 8, cursor: "pointer", minWidth: 160, minHeight: 48 }}><Text styleMap={{ color: "#ffffff", fontSize: 18, fontWeight: "600", textAlign: "center" }} data={{ content: props.heroCtaText }}>{props.heroCtaText}</Text></Container></Container>{props.children}</Container>
);
