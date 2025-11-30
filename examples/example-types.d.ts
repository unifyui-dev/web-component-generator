interface Breadcrumbs {
  styleMap: {
    "--breadcrumb-link-color": string;
  };
  data: {
    breadcrumb1: string;
    breadcrumb2: string;
    breadcrumb3: string;
  };
}

interface Button {
  styleMap: {
    "--button-bg-color": string;
  };
  data: {
    buttonContent: string;
  };
}

interface Card {
  styleMap: {
    "--card-button-bg-color": string;
  };
  data: {
    cardButtonText: string;
    cardDescription: string;
    cardImageSrc: string;
    cardTitle: string;
  };
}

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
}

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
}

interface Page {
  children: any[];
}
