import Header from "../components/Header"
import BooksGrid from "../components/BooksGrid"

const books = [
    { image: "https://ew.com/thmb/hqQXu21KjjRzkkjtxaOELhKwvxE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/HeirtoTheEmpirebyTimothyZahn112823-9af44d6adf5c4e16960101de9fb4e7dc.JPG", title: "Heir to the Empire (Star Wars: The Thrawn Trilogy, Vol. 1)", price: 53.74 },
    { image: "https://m.media-amazon.com/images/I/81mD2PbmGQL._AC_UF1000,1000_QL80_.jpg", title: "The Neverending Story", price: 47.94 },
    { image: "https://m.media-amazon.com/images/I/81LZXcfKqJL._SL1500_.jpg", title: "The Housemaid's Secret", price: 16.99 },
    { image: "https://m.media-amazon.com/images/I/71wUhI0MFvL._AC_UF1000,1000_QL80_.jpg", title: "Minecraft: Redstone Handbook", price: 32.45 },
    { image: "https://m.media-amazon.com/images/I/71K+9YJ7VbL._SL1500_.jpg", title: "Dog Man: Big Jim Begins", price: 19.99 },
    { image: "https://m.media-amazon.com/images/I/71vE85OsuDL._SL1000_.jpg", title: "Fuzzy Hygge Colouring Book", price: 10.99 },
    { image: "https://m.media-amazon.com/images/I/81Lib5DkfML._SL1500_.jpg", title: "Deep End", price: 39.99 },
    { image: "https://m.media-amazon.com/images/I/914HWd0RxsL._SL1500_.jpg", title: "Fourth Wing", price: 27.99 },
    { image: "https://m.media-amazon.com/images/I/912fTvsUKLL._SL1500_.jpg", title: "Iron Flame", price: 16.99 },
    { image: "https://m.media-amazon.com/images/I/61azTLgsSwL._SL1499_.jpg", title: "Inner Excellence", price: 18.97 },
    { image: "https://m.media-amazon.com/images/I/81ANaVZk5LL._SL1500_.jpg", title: "Atomic Habits", price: 36.00 },
    { image: "https://m.media-amazon.com/images/I/71yR+jQLqXL._SL1500_.jpg", title: "Bill Gates: Source Code", price: 37.95 },
    { image: "https://m.media-amazon.com/images/I/81-KLOJ2RtL._SL1500_.jpg", title: "Wings of Starlight", price: 25.24 },
    { image: "https://m.media-amazon.com/images/I/81T+MGY00AL._SL1500_.jpg", title: "Evolution in Bread", price: 47.00 },
    { image: "https://m.media-amazon.com/images/I/81KGbvxNErL._SL1500_.jpg", title: "I'll Love You Till The Cows Come Home", price: 12.50 },
    { image: "https://m.media-amazon.com/images/I/81F30JDZU9L._SL1500_.jpg", title: "Why A Daughter Needs A Dad", price: 16.50 },
    { image: "https://m.media-amazon.com/images/I/81IM6vEPvLL._SL1500_.jpg", title: "The Crash", price: 24.35 },
    { image: "https://m.media-amazon.com/images/I/71Ha3OShqSL._SL1500_.jpg", title: "The Body Keeps The Score", price: 25.00 },
    { image: "https://m.media-amazon.com/images/I/81YYStQvnsL._SL1500_.jpg", title: "I Love You Like No Otter", price: 13.50 },
]

const HomePage = () => {
    return (
        <div className="main">
            <Header />
            <BooksGrid />
        </div>
    );
}

export default HomePage;