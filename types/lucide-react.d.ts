// types/lucide-react.d.ts

declare module "lucide-react" {
	import * as React from "react";

	export interface IconProps extends React.SVGAttributes<SVGElement> {
		size?: number | string;
		color?: string;
	}

	export const Menu: React.FC<IconProps>;
	export const X: React.FC<IconProps>;
	export const ArrowUpLeft: React.FC<IconProps>;
	export const Home: React.FC<IconProps>;
	export const User: React.FC<IconProps>;
	export const LogIn: React.FC<IconProps>;
	export const Plus: React.FC<IconProps>;
	export const Sun: React.FC<IconProps>;
	export const Moon: React.FC<IconProps>;
	export const Upload: React.FC<IconProps>;
	export const Image: React.FC<IconProps>;
	export const ChevronsDown: React.FC<IconProps>;
	// 추가적인 아이콘이 필요하면 여기에 선언하세요.
}
