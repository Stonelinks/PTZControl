import React from "react";
import { navigate } from "../utils/url";

const PaginationControls: React.FC<{
  currPage: number;
  setCurrPage: (n: number) => void;
}> = ({ currPage, setCurrPage }) => {
  const nav = (page: number) => {
    // navigate(urlAppValue, urlBranch, page);
  };
  return (
    <div>
      {currPage > 0 ? (
        <button onClick={() => nav(currPage - 1)}>Prev page</button>
      ) : null}
      <button onClick={() => nav(currPage + 1)}>Next page</button>
    </div>
  );
};

export default PaginationControls;
