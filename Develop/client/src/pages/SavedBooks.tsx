import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../utils/queries.ts';
import { REMOVE_BOOK } from '../utils/mutations.ts';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

interface Book {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image: string;
  link: string;
}

interface UserData {
  me: {
    savedBooks: Book[];
  };
}

const SavedBooks: React.FC = () => {
  const { loading, data } = useQuery<UserData>(GET_ME);
  const [removeBook] = useMutation(REMOVE_BOOK);
  const userData = data?.me || { savedBooks: [] };

  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) return false;

    try {
      await removeBook({
        variables: { bookId },
        update: (cache, { data: { removeBook } }) => {
          const { me } = cache.readQuery<UserData>({ query: GET_ME })!;
          cache.writeQuery({
            query: GET_ME,
            data: { me: { ...me, savedBooks: removeBook.savedBooks } },
          });
        },
      });
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <h2>LOADING...</h2>;

  return (
    <Container>
      <h2>
        {userData.savedBooks.length
          ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
          : 'You have no saved books!'}
      </h2>
      <Row>
        {userData.savedBooks.map((book) => (
          <Col md="4" key={book.bookId}>
            <Card border="dark">
              {book.image && <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant="top" />}
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <p className="small">Authors: {book.authors.join(', ')}</p>
                <Card.Text>{book.description}</Card.Text>
                <Button className="btn-block btn-danger" onClick={() => handleDeleteBook(book.bookId)}>
                  Delete this Book!
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SavedBooks;
