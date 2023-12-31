import { Binoculars, MagnifyingGlass } from 'phosphor-react'
import { Sidebar } from '../../components/Sidebar'
import {
    Book,
    BookInfo,
    Container,
    ExploreContainer,
    FilterAnswer,
    RadioGroupItem,
    FormContainer,
    InfoContainer,
    Label,
    PageTitle,
    RadioGroupRoot,
    ReadLabel,
    RadioGroupIndicator,
    PageContent,
} from './styles'
import { useContext, useEffect, useMemo, useState } from 'react'
import { StarRater } from '../../components/StarRater'
import { BookProfile } from '../../components/BookProfile'
import { BookVerseContext } from '../../context/BookVerseContext'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../lib/axios'
import { v4 as uuidv4 } from 'uuid'
import { BookImage } from '../../components/BookImage'
import { ToggleMenu } from '../../components/ToggleMenu'

interface BookProps {
    id: string
    name: string
    author: string
    summary: string
    cover_url: string
    total_pages: number
    category: string
    created_at: Date
    read?: boolean
    ratingAverage: 0 | 1 | 2 | 3 | 4 | 5
    refetch?: () => Promise<BookProps[]>
}

const searchFormSchema = z.object({
    textInput: z.string(),
    category: z.enum([
        'all',
        'computer',
        'education',
        'fantasy',
        'sci-fi',
        'horror',
        'hqs',
        'suspense',
    ]),
})

type SearchFormInputs = z.infer<typeof searchFormSchema>

export default function Explore() {
    const [booksList, setBooksList] = useState<BookProps[]>([])
    const { bookProfileState, changeBookProfileState } =
        useContext(BookVerseContext)

    useEffect(() => {
        const fetchInitialBooks = async () => {
            try {
                const response = await api.get('/explore-search', {
                    params: {
                        textInput: '',
                        category: 'all',
                    },
                })
                const { data } = response
                setBooksList([...data])
            } catch (error) {
                console.error('Error:', error)
            }
        }

        fetchInitialBooks()
    }, [])

    const { register, handleSubmit, control, watch } =
        useForm<SearchFormInputs>({
            resolver: zodResolver(searchFormSchema),
            defaultValues: {
                textInput: '',
                category: 'all',
            },
        })

    const handleSearchBooks = async (data?: SearchFormInputs) => {
        let searchFilterQuery = {
            textInput: '',
            category: 'all',
        }
        if (data) {
            searchFilterQuery = {
                textInput: data.textInput,
                category: data.category,
            }
        } else {
            searchFilterQuery = {
                textInput: watch().textInput,
                category: watch().category,
            }
        }

        try {
            const response = await api.get('/explore-search', {
                params: searchFilterQuery,
            })

            const { data } = response
            setBooksList([...data])
            return data
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const filteredBooks = useMemo(() => {
        return booksList.map((book) => (
            <Book
                key={uuidv4()}
                onClick={() =>
                    changeBookProfileState({
                        openStatus: true,
                        id: book.id,
                        imagUrl: book.cover_url,
                    })
                }
            >
                <InfoContainer>
                    {book.read && (
                        <ReadLabel>
                            <strong>Read</strong>
                        </ReadLabel>
                    )}

                    <BookImage
                        width={108}
                        height={152}
                        imgUrl={book.cover_url}
                    />

                    <BookInfo>
                        <strong>{book.name}</strong>
                        <span>{book.author}</span>
                        <StarRater rate={book.ratingAverage} />
                    </BookInfo>
                </InfoContainer>
            </Book>
        ))
    }, [booksList, changeBookProfileState])

    return (
        <>
            {bookProfileState.openStatus ? <BookProfile /> : ''}

            <Container>
                <Sidebar />
                <ToggleMenu />
                <PageContent>
                    <ExploreContainer
                        onSubmit={handleSubmit((data) =>
                            handleSearchBooks(data)
                        )}
                    >
                        <PageTitle>
                            <Binoculars size={32} />
                            <h2>Explore</h2>
                            <FormContainer>
                                <input
                                    type='text'
                                    placeholder='Search Content'
                                    {...register('textInput')}
                                />
                                <MagnifyingGlass size={20} />
                            </FormContainer>
                        </PageTitle>
                        <Controller
                            name='category'
                            control={control}
                            render={({ field: { onChange } }) => {
                                return (
                                    <RadioGroupRoot
                                        defaultValue='all'
                                        required={true}
                                        aria-label='category'
                                        onValueChange={(value) => {
                                            onChange(value)
                                            handleSearchBooks()
                                        }}
                                    >
                                        <RadioGroupItem value='all' id='all'>
                                            <RadioGroupIndicator />
                                            <Label htmlFor='all'>All</Label>
                                        </RadioGroupItem>
                                        <RadioGroupItem
                                            value='computer'
                                            id='computer'
                                        >
                                            <RadioGroupIndicator />
                                            <Label htmlFor='computer'>
                                                Computer
                                            </Label>
                                        </RadioGroupItem>
                                        <RadioGroupItem
                                            value='education'
                                            id='education'
                                        >
                                            <RadioGroupIndicator />
                                            <Label htmlFor='education'>
                                                Education
                                            </Label>
                                        </RadioGroupItem>
                                        <RadioGroupItem
                                            value='fantasy'
                                            id='fantasy'
                                        >
                                            <RadioGroupIndicator />
                                            <Label htmlFor='fantasy'>
                                                Fantasy
                                            </Label>
                                        </RadioGroupItem>
                                        <RadioGroupItem
                                            value='sci-fi'
                                            id='scifi'
                                        >
                                            <RadioGroupIndicator />
                                            <Label htmlFor='sci-fi'>
                                                Sci-Fi
                                            </Label>
                                        </RadioGroupItem>
                                        <RadioGroupItem
                                            value='horror'
                                            id='horror'
                                        >
                                            <RadioGroupIndicator />
                                            <Label htmlFor='horror'>
                                                Horror
                                            </Label>
                                        </RadioGroupItem>
                                        <RadioGroupItem value='hqs' id='hqs'>
                                            <RadioGroupIndicator />
                                            <Label htmlFor='hqs'>HQs</Label>
                                        </RadioGroupItem>
                                        <RadioGroupItem
                                            value='suspense'
                                            id='suspense'
                                        >
                                            <RadioGroupIndicator />
                                            <Label htmlFor='suspense'>
                                                Suspense
                                            </Label>
                                        </RadioGroupItem>
                                    </RadioGroupRoot>
                                )
                            }}
                        />
                    </ExploreContainer>
                    <FilterAnswer>{filteredBooks}</FilterAnswer>
                </PageContent>
            </Container>
        </>
    )
}
