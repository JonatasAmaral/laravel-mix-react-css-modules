/** @typedef { Array<any> |	Object<string, any>} Clonable */

/**
 * Recursively create a deep clone of Arrays and/or Objects
 * 
 * Solves the problem of JS keeping only children's refs,
 * so editing nested props in B also changes in A
 * 
 * @template ToClone
 * @param { ToClone } thingToClone - a *initial* type of object to clone (not it's children)
 * @return { ToClone } - the "with no refs" cloned Object/Array at recursion end
 */
export function deepClone(thingToClone) {
	if (Array.isArray(thingToClone)) return thingToClone.map(item => deepClone(item))

	// since RegExp is an object, check it first
	if (thingToClone instanceof RegExp) return thingToClone

	if (typeof thingToClone === 'object' && thingToClone !== null) {
		let copyObj = {}
		for (let k in thingToClone) copyObj[k] = deepClone(thingToClone[k])
		return copyObj
	}

	// plain data returns untouched
	return items
}

/**
 * Contatenate two regular expressions
 * Contatena duas expressões regulares
 * [credits](https://masteringjs.io/tutorials/fundamentals/concat-regexp)
 * 
 * 
 * @param {RegExp} reg 
 * @param {RegExp} exp 
 * @returns RegExp
 */
export function concatRegexp(reg, exp) {
	let flags = reg.flags + exp.flags;
	flags = Array.from(new Set(flags.split(''))).join();
	return new RegExp(reg.source + exp.source, flags);
}