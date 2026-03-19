export default function SearchBar({ onSearch }) {
    return (
    <div>
        <input placeholder="Search recipes..." />
        <button onClick={onSearch}>Search</button>
    </div>
    );
}