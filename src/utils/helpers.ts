const ellipsisText = (text: string, length: number) => {
	return (text || "").trim().substr(0, length) + " ...";
};

export { ellipsisText };
