import React from 'react';
import { Container } from '../components/Container';
import { Image } from '../components/Image';
import { Text } from '../components/Text';
import './HeroSection.css';
interface HeroSection {
  styleMap: {
    "--hero-cta-bg-color": string;
  };
  data: {
    heroCtaText: string;
    heroHeading: string;
    heroImageSrc: string;
    heroSubheading: string;
  };
  children?: React.ReactNode;
}

export const HeroSection = (props: HeroSection) => (
  <Container style={{ "--hero-cta-bg-color": props.styleMap?.["--hero-cta-bg-color"] }} className="herosection-root"><Image className="herosection-root-container-0" data={{ src: props.data?.heroImageSrc }}></Image><Container className="herosection-root-container-1"><Text className="herosection-root-container-1-container-0" data={{ content: props.data?.heroHeading }}>{props.data?.heroHeading}</Text><Text className="herosection-root-container-1-container-1" data={{ content: props.data?.heroSubheading }}>{props.data?.heroSubheading}</Text><Container className="herosection-root-container-1-container-2"><Text className="herosection-root-container-1-container-2-container-0" data={{ content: props.data?.heroCtaText }}>{props.data?.heroCtaText}</Text></Container></Container>{props.children}</Container>
);
