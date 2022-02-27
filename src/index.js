import mix from "laravel-mix";
import ReactCSSModules from "./ReactCSSModules";

mix.extend(ReactCSSModules.name(), new ImportCssModules());
