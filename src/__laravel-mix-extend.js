/**
 * @file Script de alteração dos loaders do laravel-mix, para importar cssModules apenas nos arquivos pertinentes
 * adaptado do pacote [laravel-mix-react-css-modules](https://www.npmjs.com/package/laravel-mix-react-css-modules)
 * 
 * @author Jonatas Amaral
 */

import { deepClone, concatRegexp } from "./helpers";

/**
 * Extende as capacidades do laravel-mix,
 * e permitindo importar cssModules explicitamente,
 * via diretiva/query na importação `*.[s]css?module`
 * 
 * Mantem importação de estilo global normalmente para endereços simples
 * 
 * 1. exclui `*.?module[s]` das importações de estilo comum (global)
 * 2. adiciona `.*?module[s]` para importações de cssModules
 */
class ImportCssModules {
	static extensionName = "cssModules";

	constructor() {
		// configurações padrão

		// estilo de nomes de classes padrão, se não definido na hora do uso no laravel-mix
		this.classNamePattern = "[path]__[local]___[id]-[hash:base64:8]";

		// habilita a criação de sourceMaps por padrão
		this.sourceMap = true
	}

	register(args = {}) {
		// parametros opcionais
		const { classNamePattern, sourceMap } = args;
		if (classNamePattern) {
			this.classNamePattern = classNamePattern;
		}

		if (sourceMap) {
			this.sourceMap = sourceMap;
		}
	}

	webpackConfig(config) {

		/** mudar as regras de loaders de estilos (css | sass | ...) */
		config.module.rules = config.module.rules.map(rule => {
			/**
			 * Para cada regra:
			 * 
			 * Se for regra geral de importação de estilo (tem `css-modules` no array de loaders)
			 * 
			 * _não inclui loaders proprios em formato de string/array com string composta:_
			 * - _`loaders: "A!B!C"`_
			 * - _`loaders: ["A!B!C"]`_
			 * */
			if (Array.isArray(rule.loaders) && (
				rule.loaders.some(
					loader => loader === "css-loader" ||
						loader.loader === "css-loader"
				)
			)) {
				// faz cópia profundas das regras, e torna de cssModules
				let cssModulesLoader = deepClone(rule.loaders).map(loader => {
					// se o loader atual for css-loader do tipo string, muda pra objeto
					if (loader === "css-loader" || loader === "sass-loader") {
						loader = { loader, options: {} }
					}
					// se for um objeto de css-loader
					if (loader.loader === "css-loader") {
						loader.options.modules = true
						loader.options.localIdentName = this.classNamePattern
						loader.options.sourceMap = this.sourceMap
						loader.options.url = true // habilitar resolver aliases
					}

					// se for sass-loader, habilita resolução de aliases em @import
					if (loader === "sass-loader") {
						loader.options.import = true
					}

					// se não é css-loader, não altera
					return loader;
				});

				// insere oneOf, com as regras na seguinte ordem
				// 1 .module.css | .modules.css
				// 2 .css?module | .css?modules
				// 3 .css
				return {
					oneOf: [
						{
							...rule,
							loaders: cssModulesLoader,
							test: concatRegexp(/\.modules?/, RegExp(rule.test)) // garante que o test é um RegExp
						},
						{ ...rule, loaders: cssModulesLoader, resourceQuery: /modules?/ },
						rule
					]
				}
			}

			// se não for regra de loader, não faz nada
			return rule;
		})
	}
}
