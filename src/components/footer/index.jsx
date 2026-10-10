import { Tooltip } from "react-tooltip";
import { FaFacebookF, FaGithub, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FiCoffee, FiGlobe, FiHeart, FiMail, FiPenTool } from "react-icons/fi";
import styles from "./styles.module.css";

const socialLinks = [
    {
        label: "Portfolio",
        domain: "ashishranjan.net",
        href: "https://www.ashishranjan.net",
        icon: FiGlobe,
    },
    {
        label: "GitHub",
        domain: "github.com/a2rp",
        href: "https://github.com/a2rp",
        icon: FaGithub,
    },
    {
        label: "CodePen",
        domain: "codepen.io/ash1198",
        href: "https://codepen.io/ash1198",
        icon: FiPenTool,
    },
    {
        label: "LinkedIn",
        domain: "linkedin.com/in/aashishranjan",
        href: "https://www.linkedin.com/in/aashishranjan",
        icon: FaLinkedinIn,
    },
    {
        label: "Facebook",
        domain: "facebook.com/theash.ashish",
        href: "https://www.facebook.com/theash.ashish/",
        icon: FaFacebookF,
    },
    {
        label: "YouTube",
        domain: "youtube.com/@ashishranjan-ashz",
        href: "https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1",
        icon: FaYoutube,
    },
    {
        label: "Email",
        domain: "ash.ranjan09@gmail.com",
        href: "mailto:ash.ranjan09@gmail.com",
        icon: FiMail,
    },
    {
        label: "Support",
        domain: "a2rp-donation-page.netlify.app",
        href: "https://a2rp-donation-page.netlify.app/",
        icon: FiHeart,
    },
    {
        label: "Buy Me a Coffee",
        domain: "buymeacoffee.com/ashishranjan",
        href: "https://buymeacoffee.com/ashishranjan",
        icon: FiCoffee,
    },
    {
        label: "Patreon",
        domain: "patreon.com/ashishranjan",
        href: "https://www.patreon.com/ashishranjan",
        icon: FiHeart,
    },
];

const Footer = () => (
    <footer className={styles.footer}>
        <div className={styles.copyright}>
            <a
                className={styles.logoLink}
                href="https://www.ashishranjan.net"
                aria-label="Ashish Ranjan portfolio"
            >
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" />
            </a>
            <span>
                © {new Date().getFullYear()}{" "}
                <a
                    className={styles.nameLink}
                    href="https://www.ashishranjan.net"
                >
                    Ashish Ranjan
                </a>
                . All rights reserved.
            </span>
        </div>
        <div className={styles.links} aria-label="Social and support links">
            {socialLinks.map(({ label, domain, href, icon: Icon }) => (
                <a
                    key={label}
                    className={styles.socialLink}
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
                    aria-label={`${label}: ${domain}`}
                    data-tooltip-id="ledgerline-footer"
                    data-tooltip-content={`${label}\n${domain}`}
                >
                    <Icon aria-hidden="true" />
                </a>
            ))}
            <a
                className={styles.socialLink}
                href="https://github.com/a2rp/subscription-billing-platform"
                target="_blank"
                rel="noreferrer"
                aria-label="Source code: github.com/a2rp/subscription-billing-platform"
                data-tooltip-id="ledgerline-footer"
                data-tooltip-content="Source code\ngithub.com/a2rp/subscription-billing-platform"
            >
                <FaGithub aria-hidden="true" />
            </a>
            <Tooltip
                id="ledgerline-footer"
                className={styles.tooltip}
                place="top"
                delayShow={250}
            />
        </div>
    </footer>
);

export default Footer;
